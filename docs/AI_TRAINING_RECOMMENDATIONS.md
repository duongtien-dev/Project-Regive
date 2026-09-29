# ReGive AI Training Recommendations

Ngay lap: 2026-09-29

Muc dich: tach cac phan AI nen can nhac train/fine-tune model rieng khoi pham vi trien khai Gemini API hien tai. Tai lieu nay de team xem qua va chot truoc khi mo rong.

## 1. Trang thai hien tai

Backend da co workflow AI version 1:
- product classification;
- condition assessment;
- quality assessment;
- second-hand price recommendation;
- human review truoc khi apply;
- khong auto-publish marketplace.

Gemini API phu hop cho giai doan hien tai vi du an can ket qua nhanh, co anh + text, va khong co dataset nhan san. Tuy nhien mot so bai toan se tot hon neu train/fine-tune khi ReGive co du du lieu thuc te.

## 2. Nguyen tac de xuat train model

Chi nen train model khi dap ung it nhat 3 dieu kien:
1. Co dataset noi bo du lon va co nhan dung.
2. Gemini/prompt thong thuong cho ket qua khong on dinh hoac khong phu hop domain.
3. Loi sai co chi phi van hanh cao: dinh gia sai, danh gia tinh trang sai, dua san pham khong phu hop len marketplace.

Khong nen train model chi de thay the prompt Gemini neu:
- chua co du lieu nhan;
- taxonomy san pham con thay doi;
- team chua chot rubric condition/quality/price;
- demo capstone chi can proof-of-concept.

## 3. Cac AI nen can nhac train model

### 3.1 Product Category Classifier

Muc tieu:
- phan loai san pham quyengop vao taxonomy cua ReGive.

Trang thai nen lam hien tai:
- dung Gemini + rules mapping.

Khi nao nen train:
- co tren 2.000-5.000 product da duoc staff gan category dung;
- category bi nham nhieu giua cac nhom gan nhau, vi du `books` vs `essentials`, `bags` vs `clothing`;
- ReGive mo rong taxonomy chi tiet hon: quan ao tre em, sach giao khoa, thiet bi hoc tap, do gia dung, thiet bi dien tu.

Du lieu can thu:
- anh san pham;
- ten san pham;
- mo ta;
- category final sau human review;
- campaign lien quan neu co.

Model goi y:
- baseline: classical text classifier hoac embedding + nearest labels;
- nang cao: multimodal classifier fine-tune neu co anh chat luong tot.

### 3.2 Condition/Defect Assessment Model

Muc tieu:
- nhan dien tinh trang ben ngoai cua san pham: moi, nhu moi, tot, chap nhan duoc, kem, hong.

Trang thai nen lam hien tai:
- Gemini Vision + human review.

Khi nao nen train:
- co tap anh that moi category va label condition tu staff;
- can giam thoi gian review kho;
- can phat hien defect lap lai: rach, vo, tray xuoc nang, thieu linh kien, mat ve sinh.

Du lieu can thu:
- 3-6 anh moi san pham tu cac goc;
- condition final;
- ghi chu defect;
- category;
- ket qua staff override AI.

Can chu y:
- day la bai toan kho vi condition phu thuoc category. Mot vet xuoc nhe tren sach khac voi vet xuoc tren laptop.
- nen bat dau bang model rieng theo nhom category lon hoac them category vao input.

### 3.3 Price Recommendation Model

Muc tieu:
- de xuat gia ban second-hand hop ly theo thi truong Viet Nam va muc tieu gay quy.

Trang thai nen lam hien tai:
- Gemini/rules de goi y gia;
- staff chinh gia khi confirm.

Khi nao nen train:
- co lich su san pham da ban thanh cong;
- co gia staff chot va gia ban thuc te;
- co du lieu thoi gian ban duoc, ton kho, ty le huy don.

Du lieu can thu:
- category;
- condition;
- quality;
- brand/model neu co;
- gia AI goi y;
- gia staff chot;
- gia niem yet;
- gia ban thuc te;
- so ngay ton kho;
- trang thai sold/listed/unpublished.

Model goi y:
- regression model cho suggested price;
- ranking/optimization model neu can can bang giua ban nhanh va toi da hoa gay quy.

Metrics:
- median absolute percentage error;
- ty le san pham ban duoc trong X ngay;
- ty le staff override gia AI.

### 3.4 Marketplace Eligibility/Risk Model

Muc tieu:
- goi y san pham co phu hop ban lai khong.

Trang thai nen lam hien tai:
- rules: damaged/poor -> khong list;
- human review.

Khi nao nen train:
- ReGive co nhieu truong hop borderline;
- can phan biet "khong ban nhung van phan phoi ho tro" vs "loai bo";
- co du lieu audit ve san pham bi tra lai/khieu nai.

Du lieu can thu:
- product info;
- condition/quality;
- staff decision;
- ly do reject/unpublish;
- buyer complaint/return neu co.

### 3.5 Volunteer/Campaign Matching

Khong nam trong Version 1 proposal.

Chi de xuat train sau khi team chot mo rong pham vi. Hien tai khong nen implement.

Neu lam sau nay:
- input: ky nang volunteer, dia diem, thoi gian ranh, lich chien dich;
- output: goi y chien dich phu hop;
- rui ro: phai tranh bias va can cho user kiem soat.

### 3.6 Beneficiary Eligibility Support

Khong nam trong Version 1 proposal.

Khong nen de AI tu duyet beneficiary. Neu co, chi nen dung AI de tom tat ho so va goi y checklist thieu.

Can human decision 100%.

## 4. Du lieu nen bat dau log ngay

De sau nay train model, backend nen luu them hoac dam bao co the truy vet:

| Du lieu | Muc dich |
|---|---|
| AI provider/model/version | So sanh chat luong theo model |
| AI raw suggestion | Lam baseline |
| Human final decision | Label chuan |
| Override fields | Biet AI sai o dau |
| Product images | Train/evaluate vision |
| Product sold price / sold date | Train pricing |
| Reject/unpublish reason | Train eligibility/risk |
| Buyer complaint/return | Danh gia chat luong marketplace |

Hien `AiAssessment` da co `provider`, `input`, `suggestion`, `finalDecision`, `rawResponse`, `reviewedBy`, `reviewedAt`, `appliedToProduct`. Day la nen tang tot. Neu train pricing, can bo sung them du lieu sau ban hang.

## 5. Lo trinh de xuat

### Giai doan 1: Gemini API + Human Review

Lam ngay:
- dung Gemini de tao suggestion;
- luu `AiAssessment`;
- review/confirm/override;
- khong auto-publish.

Trang thai: phu hop voi capstone va proposal.

### Giai doan 2: Data Collection

Lam sau khi co van hanh/demo that:
- bat buoc staff chon ly do override/reject;
- chuan hoa taxonomy category;
- chuan hoa rubric condition/quality;
- luu anh san pham on dinh.

### Giai doan 3: Offline Evaluation

Truoc khi train:
- export dataset an danh;
- do ty le AI dung theo category/condition/price;
- so sanh Gemini prompt vs heuristic vs model nho.

### Giai doan 4: Train/Fine-tune

Chi lam khi metrics cho thay can thiet:
- category classifier;
- condition defect detector;
- price regression model.

### Giai doan 5: Shadow Mode

Model train moi khong nen apply truc tiep:
- chay song song voi Gemini;
- staff khong thay hoac thay nhu "second opinion";
- do accuracy/override rate truoc khi thay doi workflow.

## 6. Ket luan

Chua can train model cho Version 1. Gemini API + human review la cach hop ly nhat de dat dung proposal.

Nen chuan bi du lieu cho 3 model tuong lai:
1. Category classifier.
2. Condition/defect assessment.
3. Price recommendation.

Nhung model nay chi nen train sau khi co du lieu nhan tu staff va lich su marketplace that.
