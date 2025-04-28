import paho.mqtt.client as mqtt
import time
import uuid

sensor_name = "led"
device_id = str(uuid.uuid4())[:8]
current_state = "off"
broker_address = "mqtt.cgl-mqtt.xyz"
broker_port = 443
broker_path = "/"

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(f"{sensor_name}/command/onoff")

def on_message(client, userdata, msg):
    global current_state
    payload = msg.payload.decode()
    print(f"Received command: {payload} on {msg.topic}")
    if payload in ["on", "off"]:
        current_state = payload
        print(f"Changed state to: {current_state}")
        client.publish(f"{sensor_name}/status/onoff", current_state)

def on_publish(client, userdata, mid):
    print(f"Message {mid} published")

client = mqtt.Client(client_id=f"device-{device_id}", transport="websockets")
client.on_connect = on_connect
client.on_message = on_message
client.on_publish = on_publish

client.tls_set()
client.ws_set_options(path=broker_path)
client.connect(broker_address, broker_port, 60)

client.loop_start()

try:
    while True:
        client.publish(f"{sensor_name}/status/onoff", current_state)
        print(f"Published status: {current_state} on {sensor_name}/status/onoff")
        print(f"Device status: {current_state}")
        time.sleep(10)
except KeyboardInterrupt:
    print("Exiting...")
    client.loop_stop()
    client.disconnect()

