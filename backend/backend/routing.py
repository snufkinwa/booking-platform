# Importing necessary modules for Channels routing and URL pattern configuration
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path 

# Importing the consumer for handling GraphQL subscriptions
from graphene_subscriptions.consumers import GraphqlSubscriptionConsumer

# Defining the main application routing
application = ProtocolTypeRouter({
    # Configuring WebSocket protocol to handle connections via a URL router
    "websocket": URLRouter([
        # Linking the WebSocket URL path 'graphql/' to the GraphqlSubscriptionConsumer
        # This consumer will handle WebSocket connections for GraphQL subscriptions
        path('graphql/', GraphqlSubscriptionConsumer)
    ]),
})