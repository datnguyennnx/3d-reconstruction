import os
import httpx
import json
import asyncio
from typing import Optional, Dict, Any, AsyncGenerator
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class DifyClient:
    def __init__(self):
        self.base_url = "https://api-production-9894.up.railway.app/v1"
        self.api_key = os.getenv("DIFY_API_KEY")
        
        if not self.api_key:
            raise ValueError("DIFY_API_KEY environment variable is not set")
            
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def stream_chat(
        self,
        query: str,
        user_id: str,
        conversation_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat responses from Dify"""
        message = {
            "inputs": {},  # Required by API even if empty
            "query": query,
            "user": user_id,  # API expects 'user' not 'user_id'
            "response_mode": "streaming",
            "conversation_id": conversation_id,
            "auto_generate_name": True
        }

        logger.info(f"Sending request to Dify API - Query: {query}, User: {user_id}")

        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    'POST',
                    f"{self.base_url}/chat-messages",
                    headers=self.headers,
                    json=message,
                    timeout=None
                ) as response:
                    logger.info(f"Received response from Dify API - Status: {response.status_code}")
                    response.raise_for_status()
                    buffer = ""
                    
                    async for chunk in response.aiter_bytes():
                        try:
                            # Decode chunk and add to buffer
                            chunk_text = chunk.decode('utf-8')
                            logger.debug(f"Received chunk: {chunk_text}")
                            buffer += chunk_text
                            
                            # Process complete lines from buffer
                            while '\n' in buffer:
                                line, buffer = buffer.split('\n', 1)
                                line = line.strip()
                                
                                if line.startswith('data: '):
                                    try:
                                        # Remove 'data: ' prefix and parse JSON
                                        data = json.loads(line[6:])
                                        logger.debug(f"Parsed data: {data}")
                                        
                                        # Forward the event as is
                                        yield f"data: {json.dumps(data)}\n\n"
                                        
                                    except json.JSONDecodeError as e:
                                        logger.error(f"Error parsing JSON: {e}, Line: {line}")
                                        continue

                        except UnicodeDecodeError as e:
                            logger.error(f"Error decoding chunk: {e}")
                            continue

                    # Process any remaining data in buffer
                    if buffer.strip():
                        if buffer.startswith('data: '):
                            try:
                                data = json.loads(buffer[6:])
                                logger.debug(f"Parsed remaining data: {data}")
                                yield f"data: {json.dumps(data)}\n\n"
                            except json.JSONDecodeError as e:
                                logger.error(f"Error parsing remaining JSON: {e}")

        except httpx.HTTPError as e:
            error_msg = str(e)
            if e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('message', error_msg)
                except json.JSONDecodeError:
                    pass
            logger.error(f"HTTP Error: {error_msg}")
            yield f"data: {json.dumps({'event': 'error', 'message': error_msg})}\n\n"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"data: {json.dumps({'event': 'error', 'message': error_msg})}\n\n"

    async def stop_generation(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """Stop ongoing generation"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat-messages/{task_id}/stop",
                    headers=self.headers,
                    json={"user": user_id}  # API expects 'user' not 'user_id'
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                error_msg = f"Error stopping generation: {str(e)}"
                if e.response is not None:
                    try:
                        error_data = e.response.json()
                        error_msg = error_data.get('message', error_msg)
                    except json.JSONDecodeError:
                        pass
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)

dify_client = DifyClient()
