import logging
from fastapi import APIRouter, WebSocket
from core.ask import askLLM

router = APIRouter()

logger = logging.getLogger(__name__)

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            logger.info(f"Received message: {data}")
            
            # Generate and stream the response
            async for token in askLLM(data):
                await websocket.send_text(token)
                logger.info(f"Sent token: {token}")
            
            # Send a special message to indicate the end of the response
            await websocket.send_text("[END]")
            logger.info("Sent [END] message")
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {str(e)}")
    finally:
        logger.info("WebSocket connection closed")
        await websocket.close()