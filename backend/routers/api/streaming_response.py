import logging
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from core.ask import askLLM
import json
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str

@router.post("/chat/stream")
async def sse_chat_endpoint(message: ChatMessage):
    async def event_generator():
        try:
            # Get the message from the request body
            query = message.message
            logger.info(f"Received message: {query}")
            
            # Stream the response
            async for token in askLLM(query):
                if isinstance(token, str) and token.startswith("[IMAGE_BASE64]"):
                    # Handle base64 image data
                    image_data = token[12:]  # Remove the [IMAGE_BASE64] prefix
                    data = json.dumps({
                        "type": "image",
                        "content": image_data
                    })
                else:
                    # Handle regular text data
                    data = json.dumps({
                        "type": "text",
                        "content": token
                    })
                
                yield f"data: {data}\n\n"
                logger.info(f"Sent {'image' if '[IMAGE_BASE64]' in token else 'text'} data")
            
            # Send end message
            yield f"data: {json.dumps({'type': 'text', 'content': '[END]'})}\n\n"
            logger.info("Sent [END] message")
            
        except Exception as e:
            logger.error(f"Error in SSE connection: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

@router.get("/chat/stream")
async def sse_endpoint():
    async def event_generator():
        try:
            # Get the query parameter
            query = "Hello"  # We'll update this to get from query params
            
            # Stream the response
            async for token in askLLM(query):
                if isinstance(token, str) and token.startswith("[IMAGE_BASE64]"):
                    # Handle base64 image data
                    image_data = token[12:]  # Remove the [IMAGE_BASE64] prefix
                    data = json.dumps({
                        "type": "image",
                        "content": image_data
                    })
                else:
                    # Handle regular text data
                    data = json.dumps({
                        "type": "text",
                        "content": token
                    })
                
                yield f"data: {data}\n\n"
                logger.info(f"Sent {'image' if '[IMAGE_BASE64]' in token else 'text'} data")
            
            # Send end message
            yield f"data: {json.dumps({'type': 'text', 'content': '[END]'})}\n\n"
            logger.info("Sent [END] message")
            
        except Exception as e:
            logger.error(f"Error in SSE connection: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )
