import logging
from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ping")
async def ping():
    logger.info("Health check endpoint called")
    return {"message": "pong"}