import logging
from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional
from core.dify_client import dify_client
from pydantic import BaseModel
import json

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default-user"
    conversation_id: Optional[str] = None

@router.get("/api/chat/stream")
async def stream_chat_get(
    message: str = Query(...),
    user_id: str = Query("default-user"),
    conversation_id: Optional[str] = Query(None)
):
    """Stream chat messages from Dify via EventSource GET"""
    try:
        logger.info(f"Received chat request (GET) - message: {message}, user_id: {user_id}")

        async def generate():
            try:
                async for chunk in dify_client.stream_chat(
                    query=message,
                    user_id=user_id,
                    conversation_id=conversation_id
                ):
                    # Validate chunk is valid JSON before yielding
                    try:
                        json.loads(chunk)
                        yield f"data: {chunk}\n\n"
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON chunk: {chunk}")

            except Exception as e:
                logger.error(f"Error in chat stream: {str(e)}")
                error_event = json.dumps({
                    "event": "error", 
                    "message": str(e)
                })
                yield f"data: {error_event}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            }
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"event": "error", "message": str(e)}
        )

@router.post("/api/chat/stream")
async def stream_chat_post(request: Request):
    """Stream chat messages from Dify via POST"""
    try:
        body = await request.json()
        message = body.get("message", "")
        user_id = body.get("user_id", "default-user")
        conversation_id = body.get("conversation_id")

        logger.info(f"Received chat request (POST) - message: {message}, user_id: {user_id}")

        async def generate():
            try:
                async for chunk in dify_client.stream_chat(
                    query=message,
                    user_id=user_id,
                    conversation_id=conversation_id
                ):
                    # Validate chunk is valid JSON before yielding
                    try:
                        json.loads(chunk)
                        yield f"data: {chunk}\n\n"
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON chunk: {chunk}")

            except Exception as e:
                logger.error(f"Error in chat stream: {str(e)}")
                error_event = json.dumps({
                    "event": "error", 
                    "message": str(e)
                })
                yield f"data: {error_event}\n\n"

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

@router.options("/api/chat/stream")
async def chat_stream_options():
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",  # 24 hours
        }
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
