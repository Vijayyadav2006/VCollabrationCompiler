class WebSocketClient {
    constructor(url) {
      this.client = new WebSocket(url);
  
      this.client.onopen = () => {
        console.log("WebSocket connection established");
      };
  
      this.client.onclose = () => {
        console.log("WebSocket connection closed");
      };
  
      this.client.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  
    send(message) {
      if (this.client.readyState === WebSocket.OPEN) {
        this.client.send(message);
      } else {
        console.error("WebSocket is not open. Ready state:", this.client.readyState);
      }
    }
  
    onMessage(callback) {
      this.client.onmessage = (event) => {
        callback(event.data);
      };
    }
  
    onError(callback) {
      this.client.onerror = (error) => {
        callback(error);
      };
    }
  
    close() {
      this.client.close();
    }
  }
  
  export default WebSocketClient;
  