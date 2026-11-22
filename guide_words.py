"""Bundled interface strings in Korean, English, Vietnamese, Japanese, Simplified Chinese, Thai, Filipino, and Mongolian."""
LANGS = ('ko','en','vi','ja','zh-CN','th','tl','mn')
NAMES = dict(zip(LANGS, ('한국어','English','Tiếng Việt','日本語','简体中文','ไทย','Filipino','Монгол')))
ROWS = '''
brand|스마트폰 사용 안내|Smartphone Guide|Hướng dẫn dùng điện thoại|スマートフォン使い方ガイド|智能手机使用指南|คู่มือใช้สมาร์ตโฟน|Gabay sa Smartphone|Ухаалаг утасны гарын авлага
brand_d|배우고, 연습하고, 가족과 함께|Learn, practice, and connect|Học, thực hành và kết nối|学んで、練習して、家族とつながる|学习、练习、联系家人|เรียนรู้ ฝึกฝน และติดต่อครอบครัว|Matuto, magsanay, at makipag-ugnayan|Сурч, дадлага хийж, гэр бүлтэйгээ холбогдоорой
tag|내 속도로 배우는 스마트폰|Learn at your own pace|Học theo nhịp của bạn|自分のペースで学ぶ|按自己的节奏学习|เรียนตามจังหวะของคุณ|Matuto sa sarili mong bilis|Өөрийн хурдаар сураарай
hero|무엇을 해볼까요?|What shall we try?|Bạn muốn thử làm gì?|何をやってみますか？|想试试什么？|อยากลองทำอะไรดี?|Ano ang gusto mong subukan?|Юу туршиж үзэх вэ?
lead|전화부터 인증번호까지, 하나씩 눌러 보며 배워요.|From calls to verification codes, learn one tap at a time.|Từ gọi điện đến mã xác minh, hãy thử từng bước.|電話から確認コードまで、一つずつ押して学びましょう。|从打电话到验证码，一步一步来。|ตั้งแต่โทรศัพท์ถึงรหัสยืนยัน ลองกดทีละขั้น|Mula sa pagtawag hanggang sa code, subukan nang paisa-isa.|Дуудлагаас баталгаажуулах код хүртэл нэг нэгээр туршаарай.
topics|하고 싶은 일을 골라요|Choose what to do|Chọn việc bạn muốn làm|やりたいことを選ぶ|选一项想做的事|เลือกสิ่งที่อยากทำ|Piliin ang gusto mong gawin|Хийх зүйлээ сонгоорой
pick|카드를 누르면 바로 시작해요.|Tap a card to start.|Chạm vào một thẻ để bắt đầu.|カードを押すと始まります。|点按卡片即可开始。|แตะการ์ดเพื่อเริ่ม|I-tap ang card para magsimula.|Карт дээр дарж эхэлнэ.
calls|전화|Phone calls|Gọi điện|電話|电话|โทรศัพท์|Tawag|Дуудлага
calls_d|전화 걸기와 받기|Make and answer calls|Gọi và nhận cuộc gọi|電話をかける・受ける|拨打和接听电话|โทรออกและรับสาย|Tumawag at sumagot|Залгах, дуудлага авах
family|가족 채팅|Family chat|Trò chuyện gia đình|家族チャット|家庭聊天|แชตครอบครัว|Chat ng pamilya|Гэр бүлийн чат
family_d|가족과 대화하기|Talk to your family|Trò chuyện với người thân|家族と話す|和家人聊天|คุยกับครอบครัว|Makipag-usap sa pamilya|Гэр бүлтэйгээ ярилцах
gallery|사진|Photos|Ảnh|写真|照片|รูปภาพ|Larawan|Зураг
gallery_d|사진 찍고 보내기|Take and send photos|Chụp và gửi ảnh|写真を撮る・送る|拍照和发送照片|ถ่ายและส่งรูป|Kumuha at magpadala ng larawan|Зураг авч илгээх
internet|인터넷|Internet|Internet|インターネット|互联网|อินเทอร์เน็ต|Internet|Интернэт
internet_d|검색과 지도 사용|Search and use maps|Tìm kiếm và dùng bản đồ|検索と地図を使う|搜索和使用地图|ค้นหาและใช้แผนที่|Maghanap at gumamit ng mapa|Хайх, газрын зураг ашиглах
login|로그인|Log in|Đăng nhập|ログイン|登录|เข้าสู่ระบบ|Mag-log in|Нэвтрэх
login_d|내 계정으로 들어가기|Open your account|Vào tài khoản của bạn|自分のアカウントに入る|进入自己的账号|เข้าบัญชีของคุณ|Buksan ang account mo|Өөрийн бүртгэлд нэвтрэх
signup|회원가입|Sign up|Đăng ký|新規登録|注册|สมัครบัญชี|Mag-sign up|Бүртгүүлэх
signup_d|새 계정 만들기|Make a new account|Tạo tài khoản mới|新しいアカウントを作る|创建新账号|สร้างบัญชีใหม่|Gumawa ng account|Шинэ бүртгэл үүсгэх
verify|인증번호|Verification code|Mã xác minh|確認コード|验证码|รหัสยืนยัน|Verification code|Баталгаажуулах код
verify_d|문자로 온 숫자 확인하기|Find the code in a text|Xem mã trong tin nhắn|SMSに届いた数字を確認|查看短信里的数字|ดูตัวเลขในข้อความ|Hanapin ang code sa SMS|Мессежээс кодоо харах
copy|복사·붙여넣기|Copy and paste|Sao chép và dán|コピー・貼り付け|复制和粘贴|คัดลอกและวาง|Kopyahin at i-paste|Хуулах, буулгах
copy_d|글자와 숫자 옮기기|Move text and numbers|Chuyển chữ và số|文字や数字を移す|转移文字和数字|ย้ายตัวอักษรและตัวเลข|Ilipat ang teksto at numero|Бичвэр, тоо зөөх
sim|가상 연습|Practice phone|Điện thoại thực hành|練習用スマホ|模拟练习|โทรศัพท์จำลอง|Teleponong ensayo|Дадлагын утас
sim_d|가상 휴대폰으로 미리 해보기|Try it on a virtual phone|Thử trên điện thoại mô phỏng|練習用スマホで試す|在模拟手机上试一试|ลองใช้โทรศัพท์จำลอง|Subukan sa virtual na telepono|Загвар утсан дээр турших
help|도움 요청|Ask for help|Nhờ giúp đỡ|助けを求める|请求帮助|ขอความช่วยเหลือ|Humingi ng tulong|Тусламж хүсэх
help_d|막히면 가족에게 물어보기|Ask family when you get stuck|Hỏi người thân khi gặp khó khăn|困ったら家族に聞く|遇到困难就问家人|ถามครอบครัวเมื่อติดขัด|Magtanong sa pamilya kung nahihirapan|Гацвал гэр бүлээсээ асуух
resume|이어서 배우기|Keep learning|Học tiếp|学習を続ける|继续学习|เรียนต่อ|Ituloy ang pag-aaral|Үргэлжлүүлэн сурах
favorites|즐겨찾기|Favorites|Mục yêu thích|お気に入り|收藏|รายการโปรด|Mga paborito|Дуртай зүйлс
safe|안전 교육|Stay safe|Học cách an toàn|安全に使う|安全使用|ใช้อย่างปลอดภัย|Manatiling ligtas|Аюулгүй хэрэглээ
catalog|모든 학습|All lessons|Tất cả bài học|すべての学習|全部课程|บทเรียนทั้งหมด|Lahat ng aralin|Бүх хичээл
fix|문제 해결|Fix a problem|Khắc phục sự cố|困ったとき|解决问题|แก้ปัญหา|Ayusin ang problema|Асуудал шийдэх
settings|설정|Settings|Cài đặt|設定|设置|การตั้งค่า|Mga setting|Тохиргоо
profile|프로필|Profile|Hồ sơ|プロフィール|个人资料|โปรไฟล์|Profile|Хувийн мэдээлэл
home|홈으로|Home|Trang chủ|ホーム|主页|หน้าหลัก|Home|Нүүр
previous|이전|Back|Quay lại|前へ|上一步|ย้อนกลับ|Bumalik|Буцах
next|다음 단계|Next step|Bước tiếp theo|次のステップ|下一步|ขั้นถัดไป|Susunod na hakbang|Дараагийн алхам
step|단계|Step|Bước|ステップ|步骤|ขั้น|Hakbang|Алхам
listen|설명 듣기|Listen|Nghe hướng dẫn|説明を聞く|听说明|ฟังคำแนะนำ|Makinig|Сонсох
no_voice|이 언어의 음성이 없어요. 화면의 글을 봐 주세요.|This device has no voice for this language. Please read the text.|Thiết bị không có giọng đọc cho ngôn ngữ này. Vui lòng đọc hướng dẫn.|この言語の音声がありません。画面の文字をご覧ください。|此设备没有这种语言的语音，请阅读屏幕上的文字。|เครื่องนี้ไม่มีเสียงสำหรับภาษานี้ โปรดอ่านข้อความ|Walang boses para sa wikang ito. Basahin ang teksto sa screen.|Энэ хэлний дуу хоолой байхгүй. Дэлгэцийн бичвэрийг уншина уу.
cert|공동인증서|Digital certificate|Chứng thư số|電子証明書|数字证书|ใบรับรองดิจิทัล|Digital na sertipiko|Цахим гэрчилгээ
simple|간편인증|Simple verification|Xác minh đơn giản|かんたん本人確認|便捷验证|การยืนยันแบบง่าย|Madaling pagpapatunay|Хялбар баталгаажуулалт
contacts|연락처|Contacts|Danh bạ|連絡先|联系人|รายชื่อ|Mga contact|Харилцагчид
sms|문자|Messages|Tin nhắn|メッセージ|短信|ข้อความ|Mga mensahe|Мессеж
camera|카메라|Camera|Máy ảnh|カメラ|相机|กล้อง|Camera|Камер
wifi|와이파이|Wi-Fi|Wi-Fi|Wi-Fi|无线网络|Wi-Fi|Wi-Fi|Wi-Fi
font|글자 크기|Text size|Cỡ chữ|文字サイズ|文字大小|ขนาดตัวอักษร|Laki ng teksto|Үсгийн хэмжээ
device|휴대폰 종류|Phone type|Loại điện thoại|端末の種類|手机类型|ประเภทโทรศัพท์|Uri ng telepono|Утасны төрөл
normal|보통|Normal|Vừa|標準|标准|ปกติ|Karaniwan|Хэвийн
large|크게|Large|Lớn|大|大|ใหญ่|Malaki|Том
xl|아주 크게|Very large|Rất lớn|特大|特大|ใหญ่มาก|Napakalaki|Маш том
voice|음성 안내|Spoken guidance|Hướng dẫn bằng giọng nói|音声案内|语音引导|เสียงแนะนำ|Gabay na boses|Дуут заавар
speed|읽기 속도|Reading speed|Tốc độ đọc|読み上げ速度|朗读速度|ความเร็วในการอ่าน|Bilis ng pagbasa|Унших хурд
save|저장|Save|Lưu|保存|保存|บันทึก|I-save|Хадгалах
finish|학습 완료|Finish lesson|Hoàn thành bài học|学習を完了|完成课程|จบบทเรียน|Tapusin ang aralin|Хичээл дуусгах
done|잘했어요!|Well done!|Bạn làm tốt lắm!|よくできました！|做得好！|ทำได้ดีมาก!|Magaling!|Сайн байна!
retry|괜찮아요. 다시 해봐요.|That's okay. Try again.|Không sao. Hãy thử lại.|大丈夫。もう一度試しましょう。|没关系，再试一次。|ไม่เป็นไร ลองอีกครั้ง|Ayos lang. Subukan ulit.|Зүгээр ээ, дахин оролдоорой.
quiz|복습 퀴즈|Review quiz|Câu hỏi ôn tập|復習クイズ|复习测验|แบบทบทวน|Pagsusulit|Давтлагын сорил
practice|직접 연습하기|Try it yourself|Thử thực hành|自分で練習する|亲自练习|ลองฝึกเอง|Subukan mismo|Өөрөө турших
demo|연습용이에요. 실제 전화, 문자, 가입, 인증은 하지 않아요.|Practice only. No real calls, messages, sign-ups, or verification.|Chỉ để thực hành. Không gọi, nhắn tin, đăng ký hay xác minh thật.|練習専用です。実際の通話・SMS・登録・本人確認は行いません。|仅供练习，不会真的拨打电话、发短信、注册或验证。|สำหรับฝึกเท่านั้น ไม่มีการโทร ส่งข้อความ สมัคร หรือยืนยันจริง|Pagsasanay lang. Walang totoong tawag, mensahe, pagpaparehistro, o pagpapatunay.|Зөвхөн дадлага. Бодит дуудлага, мессеж, бүртгэл, баталгаажуулалт хийхгүй.
legacy|기존 학습과 백업|Original lessons and backups|Bài học cũ và bản sao lưu|従来の学習とバックアップ|原有课程与备份|บทเรียนเดิมและข้อมูลสำรอง|Dating mga aralin at backup|Өмнөх хичээл ба нөөц
empty|아직 기록이 없어요.|No records yet.|Chưa có dữ liệu.|まだ記録がありません。|目前没有记录。|ยังไม่มีประวัติ|Wala pang tala.|Бүртгэл хараахан алга.
question|질문|Question|Câu hỏi|質問|问题|คำถาม|Tanong|Асуулт
send|보내기|Send|Gửi|送信|发送|ส่ง|Ipadala|Илгээх
cancel|취소|Cancel|Hủy|キャンセル|取消|ยกเลิก|Kanselahin|Цуцлах
preview|보내기 전 확인|Review before sending|Xem trước khi gửi|送信前の確認|发送前预览|ตรวจก่อนส่ง|Suriin bago ipadala|Илгээхийн өмнө шалгах
review|복습|Review|Ôn tập|復習|复习|ทบทวน|Balik-aral|Давтах
free|자유 연습|Free practice|Thực hành tự do|自由に練習|自由练习|ฝึกอิสระ|Malayang pagsasanay|Чөлөөт дадлага
mission|단계별 미션|Guided mission|Bài thực hành từng bước|ステップ練習|分步练习|ฝึกทีละขั้น|Gabay na pagsasanay|Алхамчилсан даалгавар
select|선택|Select|Chọn|選択|选择|เลือก|Piliin|Сонгох
paste|붙여넣기|Paste|Dán|貼り付け|粘贴|วาง|I-paste|Буулгах
copy_action|복사|Copy|Sao chép|コピー|复制|คัดลอก|Kopyahin|Хуулах
return|원래 화면으로|Return to previous screen|Về màn hình trước|元の画面へ|返回原页面|กลับหน้าก่อนหน้า|Bumalik sa dating screen|Өмнөх дэлгэц рүү
confirm|확인|Confirm|Xác nhận|確認|确认|ยืนยัน|Kumpirmahin|Батлах
not_ready|가족 연결이 설정되지 않았어요. 이 화면에서는 가족에게 전송하지 않아요.|Family connection is not set up. Nothing is sent to family from this screen.|Chưa thiết lập kết nối gia đình. Màn hình này không gửi gì cho gia đình.|家族の接続が設定されていません。この画面からは送信されません。|尚未设置家庭连接，此页面不会向家人发送内容。|ยังไม่ได้ตั้งค่าการเชื่อมต่อครอบครัว หน้านี้จะไม่ส่งข้อมูล|Hindi pa naka-set up ang koneksyon sa pamilya. Walang ipapadala mula rito.|Гэр бүлийн холболт тохируулаагүй. Энэ дэлгэцээс юу ч илгээхгүй.
privacy|비밀번호나 실제 인증번호는 보내지 마세요.|Never send passwords or real verification codes.|Không gửi mật khẩu hay mã xác minh thật.|パスワードや実際の確認コードは送らないでください。|请勿发送密码或真实验证码。|อย่าส่งรหัสผ่านหรือรหัสยืนยันจริง|Huwag magpadala ng password o totoong verification code.|Нууц үг болон бодит баталгаажуулах кодыг бүү илгээ.
contacts_kr|한국에서 신고·상담|Report or get advice in South Korea|Báo cáo và tư vấn tại Hàn Quốc|韓国での通報・相談|韩国的报警和咨询|แจ้งเหตุและขอคำปรึกษาในเกาหลีใต้|Pag-uulat at konsultasyon sa South Korea|БНСУ-д мэдээлэх, зөвлөгөө авах
police|경찰 신고|Police report|Báo cảnh sát|警察への通報|报警|แจ้งตำรวจ|Iulat sa pulis|Цагдаад мэдээлэх
fss|금융감독원 상담|Financial Supervisory Service advice|Tư vấn từ Cơ quan Giám sát Tài chính|金融監督院の相談|金融监督院咨询|ปรึกษาหน่วยงานกำกับการเงิน|Konsultasyon sa Financial Supervisory Service|Санхүүгийн хяналтын албаны зөвлөгөө
independent|이 앱은 신고를 접수하지 않는 학습용 앱이에요.|This is a learning app. It does not take reports.|Đây là ứng dụng học tập, không tiếp nhận báo cáo.|学習用のアプリです。通報は受け付けません。|本应用仅用于学习，不受理举报。|แอปนี้ใช้เพื่อเรียนรู้ ไม่รับแจ้งเหตุ|Pang-aral lang ang app. Hindi ito tumatanggap ng ulat.|Энэ бол сургалтын апп. Мэдээлэл хүлээж авахгүй.
problem_choice|막힌 상황을 골라 주세요.|Choose what is not working.|Chọn sự cố bạn gặp.|困っていることを選んでください。|选择遇到的问题。|เลือกปัญหาที่พบ|Piliin ang problemang nararanasan mo.|Тулгарсан асуудлаа сонгоорой.
fixed|해결됐어요|It works now|Đã khắc phục|解決しました|已解决|แก้ได้แล้ว|Naayos na|Шийдэгдлээ
'''
WORDS = {parts[0]:tuple(parts[1:]) for line in ROWS.strip().splitlines() if (parts := line.split('|'))}
assert all(len(row) == len(LANGS) for row in WORDS.values())
