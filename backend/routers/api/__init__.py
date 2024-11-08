from .ping import router as ping_router
from .chat import router as chat_router
from .background_removal import router as background_removal_router

routers = [
    ping_router,
    chat_router,
    background_removal_router
]
