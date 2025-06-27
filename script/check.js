const checkForm = document.getElementById('checkForm');
const resultDiv = document.getElementById('result');
const API_URL = 'https://script.google.com/macros/s/AKfycbwSuk_UltIKHDP_xP1nyngyV12CHuRdB6iKlZEQVrW_VbrAsmCKpYRiX8K3K7pB10jk/exec';

checkForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('checkName').value.trim();
  const password = document.getElementById('checkPassword').value;

  if (!name || !password) {
    resultDiv.textContent = '이름과 비밀번호를 입력해주세요.';
    return;
  }

  try {
    // 예약 조회는 GET 요청 유지
    const res = await fetch(`${API_URL}?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`);
    const result = await res.json();
    console.log('조회 응답:', result);

    if (result.status === 'not_found') {
      resultDiv.textContent = '예약 내역이 없습니다.';
    } else {
      resultDiv.innerHTML = `
        <p><strong>입실일:</strong> ${result.checkin}</p>
        <p><strong>퇴실일:</strong> ${result.checkout}</p>
        <p><strong>인원수:</strong> ${result.people}</p>
        <p><strong>요청사항:</strong> ${result.request || '없음'}</p>
        <button id="cancelBtn">예약 취소</button>
      `;

      document.getElementById('cancelBtn').addEventListener('click', async () => {
        if (!confirm('정말로 예약을 취소하시겠습니까?')) return;

        // application/x-www-form-urlencoded 방식으로 POST 보내기
        const formData = new URLSearchParams();
        formData.append('action', 'delete');
        formData.append('name', name);
        formData.append('password', password);

        try {
          const cancelRes = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          });

          const cancelResult = await cancelRes.json();
          console.log('취소 응답:', cancelResult);

          if (cancelResult.status === 'deleted') {
            resultDiv.textContent = '예약이 취소되었습니다.';
          } else if (cancelResult.status === 'not_found') {
            resultDiv.textContent = '예약 정보를 찾을 수 없습니다.';
          } else {
            resultDiv.textContent = '예약 취소에 실패했습니다.';
          }
        } catch (err) {
          resultDiv.textContent = '예약 취소 중 오류가 발생했습니다.';
          console.error(err);
        }
      });
    }
  } catch (err) {
    resultDiv.textContent = '예약 조회 중 오류가 발생했습니다.';
    console.error(err);
  }
});
