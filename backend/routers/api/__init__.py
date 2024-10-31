from .ping import router as ping_router
from .streaming_response import router as streaming_response_router
from .background_removal import router as background_removal_router

routers = [
    ping_router,
    streaming_response_router,
    background_removal_router
]
