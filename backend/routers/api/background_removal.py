import logging
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response
import io
import numpy as np
from PIL import Image
from rembg import remove

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):
    try:
        # Read the image file
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Convert the input image to numpy array
        input_array = np.array(input_image)
        
        # Remove background
        output_array = remove(input_array)
        
        # Convert back to PIL Image
        output_image = Image.fromarray(output_array)
        
        # Save to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        logger.info("Successfully removed background from image")
        return Response(content=img_byte_arr, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": str(e)}
