const form = document.getElementById('reserveForm');
const message = document.getElementById('message');
const API_URL = 'https://script.google.com/macros/s/AKfycbwSuk_UltIKHDP_xP1nyngyV12CHuRdB6iKlZEQVrW_VbrAsmCKpYRiX8K3K7pB10jk/exec';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const password = form.password.value;
  const checkin = form.checkin.value;
  const checkout = form.checkout.value;
  const people = parseInt(form.people.value, 10);
  const request = form.request.value;

  // 오늘 날짜를 YYYY-MM-DD 형식으로 구함
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (!name || !password || !checkin || !checkout || !people) {
    message.textContent = '모든 필수 항목을 입력해주세요.';
    return;
  }

  if (new Date(checkin) < new Date(todayStr)) {
    message.textContent = '입실일은 오늘 또는 미래 날짜여야 합니다.';
    return;
  }

  if (new Date(checkout) < new Date(todayStr)) {
    message.textContent = '퇴실일은 오늘 또는 미래 날짜여야 합니다.';
    return;
  }

  if (new Date(checkin) >= new Date(checkout)) {
    message.textContent = '퇴실일은 입실일보다 늦어야 합니다.';
    return;
  }

  // 입력 비활성화 및 로딩 표시
  message.textContent = '기다리는 중...';
  const inputs = form.querySelectorAll('input, textarea, button');
  inputs.forEach(el => el.disabled = true);

  const data = { name, password, checkin, checkout, people, request };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log('서버 응답:', result);

    if (result.status === 'duplicate') {
      message.textContent = '이미 예약한 정보가 존재합니다.';
      inputs.forEach(el => el.disabled = false);
    } else if (result.status === 'success') {
      message.textContent = '예약이 완료되었습니다!';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      message.textContent = '서버 오류가 발생했습니다.';
      inputs.forEach(el => el.disabled = false);
    }
  } catch (error) {
    message.textContent = '네트워크 오류가 발생했습니다.';
    console.error(error);
    inputs.forEach(el => el.disabled = false);
  }
});
