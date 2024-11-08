import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional
from core.dify_client import dify_client
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default-user"
    conversation_id: Optional[str] = None

@router.post("/api/chat/stream")
async def stream_chat(request: Request):
    """Stream chat messages from Dify"""
    try:
        body = await request.json()
        message = body.get("message", "")
        user_id = body.get("user_id", "default-user")
        conversation_id = body.get("conversation_id")

        logger.info(f"Received chat request - message: {message}, user_id: {user_id}")

        async def generate():
            try:
                async for chunk in dify_client.stream_chat(
                    query=message,
                    user_id=user_id,
                    conversation_id=conversation_id
                ):
                    logger.debug(f"Sending chunk: {chunk}")
                    yield chunk
            except Exception as e:
                logger.error(f"Error in chat stream: {str(e)}")
                error_event = f"data: {{\"event\": \"error\", \"message\": \"{str(e)}\"}}\n\n"
                logger.debug(f"Sending error event: {error_event}")
                yield error_event

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            }
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"event": "error", "message": str(e)}
        )

@router.post("/api/chat/{task_id}/stop")
async def stop_chat_generation(
    task_id: str,
    user_id: str = "default-user"
):
    """Stop ongoing chat generation"""
    try:
        logger.info(f"Stopping chat generation - task_id: {task_id}, user_id: {user_id}")
        result = await dify_client.stop_generation(task_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Error stopping chat generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"event": "error", "message": str(e)}
        )

@router.options("/api/chat/stream")
async def chat_stream_options():
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",  # 24 hours
        }
    )
