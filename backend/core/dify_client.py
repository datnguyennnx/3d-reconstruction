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
                    
                    async for line in response.aiter_lines():
                        if line.startswith('data: '):
                            try:
                                # Remove 'data: ' prefix and parse JSON
                                data = json.loads(line[6:])
                                logger.debug(f"Parsed data: {data}")
                                
                                # Standardize event format
                                if 'answer' in data:
                                    yield json.dumps({
                                        "event": "message",
                                        "answer": data['answer']
                                    })
                                elif 'type' in data and data['type'] == 'image':
                                    yield json.dumps({
                                        "event": "message_file",
                                        "type": "image",
                                        "url": data['url']
                                    })
                                elif 'conversation_id' in data:
                                    yield json.dumps({
                                        "event": "message_end",
                                        "conversation_id": data['conversation_id']
                                    })
                                
                            except json.JSONDecodeError as e:
                                logger.error(f"Error parsing JSON: {e}, Line: {line}")
                                yield json.dumps({
                                    "event": "error",
                                    "message": f"JSON parsing error: {str(e)}"
                                })
                            except Exception as e:
                                logger.error(f"Unexpected error processing line: {e}")
                                yield json.dumps({
                                    "event": "error", 
                                    "message": str(e)
                                })

        except httpx.HTTPError as e:
            error_msg = str(e)
            if e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('message', error_msg)
                except json.JSONDecodeError:
                    pass
            logger.error(f"HTTP Error: {error_msg}")
            yield json.dumps({
                "event": "error", 
                "message": error_msg
            })
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield json.dumps({
                "event": "error", 
                "message": error_msg
            })

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
