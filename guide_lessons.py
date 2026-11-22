"""Short action prompts and lesson sequences. No real personal data is used."""
from guide_words import WORDS

ROWS = '''
open|{x}을(를) 열어요.|Open {x}.|Mở {x}.|「{x}」を開きます。|打开“{x}”。|เปิด {x}|Buksan ang {x}.|{x}-г нээнэ.
tap|{x}을(를) 눌러요.|Tap {x}.|Chạm vào {x}.|「{x}」を押します。|点按“{x}”。|แตะ {x}|I-tap ang {x}.|{x} дээр дарна.
look|{x}을(를) 확인해요.|Check {x}.|Kiểm tra {x}.|「{x}」を確認します。|查看“{x}”。|ตรวจดู {x}|Tingnan ang {x}.|{x}-г шалгана.
hold|연습 글자를 길게 눌러요.|Press and hold the sample text.|Nhấn giữ chữ mẫu.|練習用の文字を長押しします。|长按示例文字。|กดข้อความตัวอย่างค้างไว้|Pindutin nang matagal ang halimbawang teksto.|Жишээ бичвэрийг удаан дарна.
keypad|키패드|Keypad|Bàn phím số|キーパッド|拨号键盘|แป้นตัวเลข|Keypad|Тоон товчлуур
dial|통화|Call|Gọi|発信|拨打|โทรออก|Tumawag|Залгах
hang|끊기|End call|Kết thúc|通話終了|挂断|วางสาย|Ibaba|Дуудлага дуусгах
new|새로 만들기|New|Tạo mới|新規作成|新建|สร้างใหม่|Gumawa ng bago|Шинээр үүсгэх
sample_num|연습용 번호|Practice number|Số thực hành|練習用番号|示例号码|หมายเลขฝึก|Halimbawang numero|Дадлагын дугаар
sample_name|연습용 이름|Practice name|Tên thực hành|練習用の名前|示例姓名|ชื่อตัวอย่าง|Halimbawang pangalan|Жишээ нэр
sample_msg|연습용 인사|Practice greeting|Lời chào mẫu|練習用のあいさつ|示例问候|คำทักทายตัวอย่าง|Halimbawang pagbati|Жишээ мэндчилгээ
sample_pw|연습용 비밀번호|Practice password|Mật khẩu thực hành|練習用パスワード|练习密码|รหัสผ่านตัวอย่าง|Halimbawang password|Дадлагын нууц үг
sample_id|연습용 아이디|Practice ID|Tên đăng nhập mẫu|練習用ID|练习账号|ชื่อบัญชีตัวอย่าง|Halimbawang ID|Дадлагын нэр
shutter|촬영|Take photo|Chụp ảnh|撮影|拍摄|ถ่ายรูป|Kumuha ng larawan|Зураг авах
sample_pic|연습 사진|Sample photo|Ảnh mẫu|練習用の写真|示例照片|รูปตัวอย่าง|Halimbawang larawan|Жишээ зураг
search|검색창|Search box|Ô tìm kiếm|検索欄|搜索框|ช่องค้นหา|Search box|Хайлтын талбар
park|공원|Park|Công viên|公園|公园|สวนสาธารณะ|Parke|Цэцэрлэгт хүрээлэн
maps|지도|Maps|Bản đồ|地図|地图|แผนที่|Mapa|Газрын зураг
sample_wifi|가상 와이파이|Practice Wi-Fi|Wi-Fi thực hành|練習用Wi-Fi|示例无线网络|Wi-Fi จำลอง|Halimbawang Wi-Fi|Дадлагын Wi-Fi
show|비밀번호 보기|Show password|Hiện mật khẩu|パスワードを表示|显示密码|แสดงรหัสผ่าน|Ipakita ang password|Нууц үг харуулах
agree|연습용 약관 동의|Accept sample terms|Đồng ý điều khoản mẫu|練習用の規約に同意|同意示例条款|ยอมรับข้อกำหนดตัวอย่าง|Tanggapin ang halimbawang tuntunin|Жишээ нөхцөлийг зөвшөөрөх
request|연습 문자 받기|Get a practice text|Nhận tin nhắn mẫu|練習用SMSを受け取る|接收练习短信|รับข้อความจำลอง|Tumanggap ng halimbawang SMS|Дадлагын мессеж авах
code_input|인증번호 입력|Enter code|Nhập mã|コード入力|输入验证码|กรอกรหัส|Ilagay ang code|Код оруулах
sample_cert|연습용 인증서|Practice certificate|Chứng thư mẫu|練習用証明書|示例证书|ใบรับรองตัวอย่าง|Halimbawang sertipiko|Дадлагын гэрчилгээ
sample_request|연습용 요청|Practice request|Yêu cầu mẫu|練習用のリクエスト|模拟请求|คำขอจำลอง|Halimbawang kahilingan|Дадлагын хүсэлт
field|빈 입력칸|Empty field|Ô nhập trống|空欄|空白输入框|ช่องว่าง|Bakanteng field|Хоосон талбар
test_only|실제 이름, 전화번호, 비밀번호, 인증번호를 입력하지 마세요.|Do not enter real names, phone numbers, passwords, or codes.|Không nhập tên, số điện thoại, mật khẩu hoặc mã thật.|実際の氏名、電話番号、パスワード、確認コードは入力しないでください。|不要输入真实姓名、电话、密码或验证码。|อย่ากรอกชื่อ เบอร์โทร รหัสผ่าน หรือรหัสจริง|Huwag ilagay ang totoong pangalan, numero, password, o code.|Бодит нэр, утасны дугаар, нууц үг, код бүү оруулаарай.
result|맞는 행동을 골라 보세요.|Choose the right action.|Chọn thao tác đúng.|正しい操作を選びます。|选择正确的操作。|เลือกการทำงานที่ถูกต้อง|Piliin ang tamang kilos.|Зөв үйлдлийг сонгоорой.
clock|시계|Clock|Đồng hồ|時計|时钟|นาฬิกา|Orasan|Цаг
verify_safe|실제 인증번호는 다른 사람에게 알려주지 않아요.|Never share a real verification code with anyone.|Không chia sẻ mã xác minh thật với người khác.|実際の確認コードは人に教えません。|不要告诉他人真实验证码。|ไม่บอกรหัสยืนยันจริงให้ผู้อื่น|Huwag ibigay ang totoong code sa iba.|Бодит баталгаажуулах кодыг бусдад бүү хэл.
safe_link|모르는 사람이 보낸 링크는 누르지 않아요.|Do not tap links from strangers.|Không chạm vào liên kết của người lạ.|知らない人からのリンクは開きません。|不要点击陌生人发送的链接。|อย่ากดลิงก์จากคนแปลกหน้า|Huwag pindutin ang link mula sa di kilala.|Танихгүй хүний холбоос дээр бүү дар.
safe_family|돈을 보내 달라고 하면 평소 알던 가족 번호로 직접 확인해요.|If asked for money, call your family on the number you already know.|Nếu được yêu cầu gửi tiền, hãy gọi người thân bằng số bạn đã biết.|送金を頼まれたら、以前から知っている家族の番号にかけて確かめます。|如果有人要求转账，请拨打之前就知道的家人号码核实。|หากถูกขอให้โอนเงิน ให้โทรหาเบอร์ครอบครัวที่รู้จักอยู่แล้ว|Kung hinihingan ng pera, tawagan ang pamilya sa numerong alam mo na.|Мөнгө нэхвэл мэддэг дугаараараа гэр бүл рүү залгаж шалгаарай.
safe_remote|낯선 사람이 시키는 원격제어 앱을 설치하지 않아요.|Do not install remote-control apps at a stranger's request.|Không cài ứng dụng điều khiển từ xa theo yêu cầu của người lạ.|知らない人に指示された遠隔操作アプリは入れません。|不要按陌生人的要求安装远程控制应用。|อย่าติดตั้งแอปควบคุมระยะไกลตามที่คนแปลกหน้าบอก|Huwag mag-install ng remote-control app sa utos ng di kilala.|Танихгүй хүний хүсэлтээр алсын удирдлагын апп бүү суулга.
safe_bank|은행에서 전화했다고 하면 끊고 공식 고객센터 번호를 찾아 직접 걸어요.|If a caller says they are from a bank, hang up and call the bank's official number.|Nếu người gọi nói là ngân hàng, hãy cúp máy và gọi số chính thức của ngân hàng.|銀行を名乗る電話は切り、公式窓口の番号を自分で調べてかけます。|若来电自称银行，请挂断并自行查找官方客服电话拨打。|หากอ้างว่าโทรจากธนาคาร ให้วางสายแล้วค้นหาเบอร์ทางการเพื่อโทรกลับ|Kung nagpapakilalang bangko ang tumawag, ibaba at tawagan ang opisyal na numero.|Банкнаас ярьж байна гэвэл таслаад албан ёсны дугаарыг олж залгаарай.
cert_def|공동인증서는 인터넷에서 본인임을 확인하는 전자 증명서예요.|A digital certificate is electronic proof of who you are online.|Chứng thư số là giấy tờ điện tử dùng để xác nhận danh tính trên mạng.|電子証明書は、インターネットで本人であることを証明するものです。|数字证书是在网上证明身份的电子凭证。|ใบรับรองดิจิทัลคือหลักฐานอิเล็กทรอนิกส์ที่ยืนยันตัวตนออนไลน์|Ang digital na sertipiko ay elektronikong patunay ng pagkakakilanlan online.|Цахим гэрчилгээ нь интернэтэд таны хэн болохыг батлах цахим баримт.
copy_def|복사한 글자는 잠시 보관돼요. 붙여넣으면 다른 곳에 들어가요.|Copied text is held briefly. Paste puts it in another place.|Chữ đã sao chép được lưu tạm. Dán để đưa chữ sang chỗ khác.|コピーした文字は一時保存され、貼り付けで別の場所に入ります。|复制的文字会暂存，粘贴可把它放到另一处。|ข้อความที่คัดลอกจะถูกเก็บไว้ชั่วคราว วางเพื่อใส่ที่อื่น|Pansamantalang nakaimbak ang kinopya. I-paste para ilagay sa ibang lugar.|Хуулсан бичвэр түр хадгалагдана. Буулгахад өөр газар орно.
free_hint|가상 앱을 골라 연습해요.|Pick a virtual app to try.|Chọn ứng dụng mô phỏng để thử.|練習用アプリを選びます。|选择一个模拟应用。|เลือกแอปจำลองเพื่อฝึก|Pumili ng virtual na app.|Дадлагын апп сонгоорой.
'''
for line in ROWS.strip().splitlines():
    key,*values=line.split('|')
    assert len(values)==8
    WORDS[key]=tuple(values)

# (kind of instruction, visible action, virtual app icon)
FLOWS = {
    'calls':[('open','calls','📞'),('tap','keypad','🔢'),('tap','sample_num','🔢'),('tap','dial','📞'),('tap','hang','📴')],
    'contacts':[('open','contacts','👤'),('tap','new','➕'),('tap','sample_name','👤'),('tap','sample_num','🔢'),('tap','save','✅')],
    'sms':[('open','sms','💬'),('tap','new','➕'),('tap','sample_name','👤'),('tap','sample_msg','💬'),('tap','send','✉️')],
    'camera':[('open','camera','📷'),('tap','shutter','📸'),('open','gallery','🖼️'),('look','sample_pic','🖼️')],
    'gallery':[('open','camera','📷'),('tap','shutter','📸'),('open','gallery','🖼️'),('look','sample_pic','🖼️')],
    'internet':[('open','internet','🌐'),('tap','search','🔍'),('tap','park','🌳'),('open','maps','🗺️')],
    'wifi':[('open','settings','⚙️'),('tap','wifi','📶'),('tap','sample_wifi','📶')],
    'font':[('open','settings','⚙️'),('tap','font','🔠'),('tap','large','🔠')],
    'login':[('tap','sample_id','👤'),('tap','sample_pw','🔑'),('tap','show','👁️'),('tap','login','🔐')],
    'signup':[('tap','signup','🪪'),('tap','sample_name','👤'),('tap','sample_num','🔢'),('tap','sample_id','👤'),('tap','sample_pw','🔑'),('tap','agree','☑️'),('tap','confirm','✅')],
    'verify':[('tap','request','📨'),('open','sms','💬'),('look','verify','🔢'),('tap','return','↩️'),('tap','code_input','🔢')],
    'copy':[('hold','select','👆'),('tap','copy_action','📋'),('tap','field','▭'),('tap','paste','📌'),('look','confirm','✅')],
    'cert':[('cert_def','sample_cert','🪪'),('tap','sample_pw','🔑'),('tap','confirm','✅')],
    'simple':[('tap','sample_request','🔔'),('look','confirm','✅')],
    'safe':[('verify_safe','confirm','🛡️'),('safe_link','confirm','🔗'),('safe_family','calls','📞'),('safe_remote','confirm','🛡️'),('safe_bank','calls','📞')],
}
