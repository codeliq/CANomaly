import socket
import json
import time
import random

# 중개 서버 정보
SERVER_HOST = "localhost"
SERVER_PORT = 9000

# CAN 패킷 데이터 생성 함수
def generate_can_packet():
    # 정상 패킷이 50% 확률로 나오도록 조정
    attack_type = random.choices(
        ["normal", "flooding", "spoofing", "fuzzing"],
        weights=[40, 20, 20, 20],  
        k=1
    )[0]

    # 기본 정상 패킷
    arbitration_id = random.choice([100, 200, 300, 400, 500])
    control_field = random.choice([6, 7, 8])
    data = " ".join([f"{random.randint(0, 255):02X}" for _ in range(8)])

    # 이상 패킷 생성 (낮은 확률)
    if attack_type == "flooding":
        arbitration_id = 0
        control_field = 8
        data = "00 00 00 00 00 00 00 00"
    
    elif attack_type == "spoofing":
        arbitration_id = random.choice([553, 366])
        control_field = random.choice([8, 7])
        data = "00 00 00 02 01 00 80 00" if arbitration_id == 553 else "28 E2 FF 28 25 00 01"

    elif attack_type == "fuzzing":
        control_field = 8
        data = " ".join([f"{random.randint(0, 255):02X}" for _ in range(8)])  # 랜덤 값

    packet = {
        "arbitration_id": arbitration_id,
        "control_field": control_field,
        "data": data,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "attack_type": attack_type  # 추가 (탐지 결과 확인용)
    }
    return packet

# TCP 소켓 생성 및 서버 연결
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((SERVER_HOST, SERVER_PORT))
print("✅ TCP 차량 클라이언트 연결됨")

try:
    while True:
        packet = generate_can_packet()
        json_data = json.dumps(packet)
        client_socket.sendall(json_data.encode("utf-8"))
        print(f"[*] 차량 데이터 전송: {json_data}")

        time.sleep(3)  # 3초마다 데이터 전송

except Exception as e:
    print(f" [※] 오류 발생: {e}")

finally:
    print("❌ TCP 연결 종료")
    client_socket.close()
