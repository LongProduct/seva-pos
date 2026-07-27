/* ============================================================
   SEVA RETAIL POS — demo logic (vanilla JS)
   Data theo SEVA_POS_MASTER_UI_UX_HTML_SPEC (mục 21).
   Mọi sản phẩm là "variant product" (single = 1 variant).
   Sections: data · state · helpers · store · products · tabs
             seller · variant selector · customer · cart · summary
             promotion/voucher · payment · success · receipt
             offline · customer display · search/keyboard · init
   ============================================================ */

/* ============================================================
   21.1 ĐIỂM BÁN
   ============================================================ */
const STORES=[
 {code:'HN-FLAGSHIP-01',name:'Seva Flagship Hà Nội',short:'Flagship Hà Nội',brand:'B1',type:'STORE',
  address:'28 Tràng Tiền, Hoàn Kiếm, Hà Nội',status:'OPEN',hours:'08:00–22:00',
  shift:'Ca sáng · 08:00–14:00',online:true,customerDisplay:true,autoPrint:true},
 {code:'HCM-LM81-01',name:'Seva Landmark 81',short:'Landmark 81',brand:'B1',type:'STORE',
  address:'Vinhomes Central Park, Bình Thạnh, TP.HCM',status:'OPEN',hours:'09:00–22:00',
  shift:'Ca chiều · 14:00–22:00',online:true,customerDisplay:true,autoPrint:false},
 {code:'HCM-POPUP-0726',name:'Seva Pop-up Vincom Đồng Khởi',short:'Pop-up Đồng Khởi',brand:'B2',type:'POPUP',
  address:'72 Lê Thánh Tôn, Quận 1, TP.HCM',status:'OPEN',hours:'10:00–21:00',
  shift:'Ca sự kiện · 10:00–18:00',online:false,customerDisplay:false,autoPrint:false}
];
const STORE_TYPE_LABEL={STORE:'Store',POPUP:'Pop-up',EVENT:'Event'};

/* ============================================================
   21.2 NHÂN VIÊN + PHIÊN ĐĂNG NHẬP
   ============================================================ */
const STAFF=[
 {id:'NV-A001',code:'A001',name:'Nguyễn Minh',short:'Minh',role:'CASHIER_SELLER',shift:'IN_SHIFT',store:'HN-FLAGSHIP-01',shiftName:'Ca sáng',avatar:'NM'},
 {id:'NV-A002',code:'A002',name:'Nguyễn Thị Thái Hòa',short:'Thái Hòa',role:'SELLER',shift:'IN_SHIFT',store:'HN-FLAGSHIP-01',shiftName:'Ca sáng',avatar:'TH'},
 {id:'NV-A003',code:'A003',name:'Lê Thị Bảo Trân',short:'Bảo Trân',role:'SELLER',shift:'IN_SHIFT',store:'HN-FLAGSHIP-01',shiftName:'Ca sáng',avatar:'BT'},
 {id:'NV-M001',code:'M001',name:'Trần Quốc Long',short:'QL Long',role:'STORE_MANAGER',shift:'IN_SHIFT',store:'HN-FLAGSHIP-01',shiftName:'Ca sáng',avatar:'TL'},
 {id:'NV-A004',code:'A004',name:'Phạm Thu Trang',short:'Thu Trang',role:'SELLER',shift:'OUT_OF_SHIFT',store:'HN-FLAGSHIP-01',shiftName:'Ca chiều',avatar:'TT'}
];
const SESSION={userId:'NV-A001',cashierId:'NV-A001',store:'HN-FLAGSHIP-01',terminal:'POS-HN01-T01',shiftId:'SHIFT-20260722-AM'};
const CURRENT_USER=STAFF.find(s=>s.id===SESSION.userId);
// Người bán được chọn = nhân viên đang trong ca tại điểm bán hiện tại
const SELLERS=STAFF.filter(s=>s.shift==='IN_SHIFT');

/* ============================================================
   21.3 DANH MỤC
   ============================================================ */
const CATS=[
 {id:'ALL',name:'Tất cả'},{id:'CHARM',name:'Charm'},{id:'RING',name:'Nhẫn'},
 {id:'BRACELET',name:'Vòng tay'},{id:'NECKLACE',name:'Vòng cổ'},{id:'CHAIN',name:'Dây'},
 {id:'SET',name:'Bộ trang sức'},{id:'GIFT_BOX',name:'Hộp quà'}
];
// emoji minh họa theo category (thay ảnh thật)
const CAT_EMOJI={CHARM:'💎',RING:'💍',BRACELET:'🪬',NECKLACE:'✨',CHAIN:'📿',SET:'🎀',GIFT_BOX:'🎁'};

/* ============================================================
   21.4 SẢN PHẨM + BIẾN THỂ (10 sản phẩm)
   ============================================================ */
const PRODUCTS=[
 {id:'P001',name:'Charm Hoa Mai Bạc',cat:'CHARM',mode:'single',displayPrice:320000,promo:null,
  variants:[{id:'V001',sku:'CHM-001',barcode:'893000000001',material:'Bạc 925',color:'Bạc',size:null,price:320000,stock:8,status:'AVAILABLE'}]},
 {id:'P002',name:'Charm Bướm Đính Đá',cat:'CHARM',mode:'single',displayPrice:360000,promo:'-20%',
  variants:[{id:'V002',sku:'CH-BM-001',barcode:'893000000002',material:'Bạc 925',color:'Trắng',size:null,price:450000,stock:2,status:'AVAILABLE'}]},
 {id:'P003',name:'Nhẫn Aurora',cat:'RING',mode:'quick',attributes:['size'],displayPrice:4500000,pricePrefix:'Từ',
  variants:[
   {id:'V010',sku:'NHA-AUR-10',barcode:'893000000010',size:'10',material:'Bạc 925',color:'Trắng',price:4500000,stock:3,status:'AVAILABLE'},
   {id:'V011',sku:'NHA-AUR-11',barcode:'893000000011',size:'11',material:'Bạc 925',color:'Trắng',price:4500000,stock:2,status:'AVAILABLE'},
   {id:'V012',sku:'NHA-AUR-12',barcode:'893000000012',size:'12',material:'Bạc 925',color:'Trắng',price:4600000,stock:1,status:'AVAILABLE'},
   {id:'V013',sku:'NHA-AUR-13',barcode:'893000000013',size:'13',material:'Bạc 925',color:'Trắng',price:4600000,stock:0,status:'OUT_OF_STOCK'}
 ]},
 {id:'P004',name:'Nhẫn Đính Đá Celestia',cat:'RING',mode:'variant',attributes:['material','color','size'],displayPrice:5200000,pricePrefix:'Từ',
  variants:[
   {id:'V020',sku:'CEL-925-W-10',material:'Bạc 925',color:'Trắng',size:'10',price:5200000,stock:2,status:'AVAILABLE'},
   {id:'V021',sku:'CEL-925-W-11',material:'Bạc 925',color:'Trắng',size:'11',price:5200000,stock:1,status:'AVAILABLE'},
   {id:'V022',sku:'CEL-10K-Y-11',material:'Vàng 10K',color:'Vàng',size:'11',price:8900000,stock:1,status:'AVAILABLE'},
   {id:'V023',sku:'CEL-10K-Y-12',material:'Vàng 10K',color:'Vàng',size:'12',price:9100000,stock:2,status:'AVAILABLE'},
   {id:'V024',sku:'CEL-18K-R-12',material:'Vàng 18K',color:'Hồng',size:'12',price:13500000,stock:0,status:'OUT_OF_STOCK'},
   {id:'V025',sku:'CEL-18K-W-11',material:'Vàng 18K',color:'Trắng',size:'11',price:13800000,stock:1,status:'RESERVED'}
 ]},
 {id:'P005',name:'Nhẫn Kim Cương Lumière',cat:'RING',mode:'serialized',displayPrice:12500000,pricePrefix:'Từ',promo:'Có chứng thư',
  items:[
   {serial:'SV001',barcode:'SV001',sku:'LUM-DIA-12',size:'12',weight:'2.15g',certificate:'GIA-001',diamond:'0.30ct · F · VS1',price:12500000,status:'AVAILABLE'},
   {serial:'SV002',barcode:'SV002',sku:'LUM-DIA-12',size:'12',weight:'2.23g',certificate:'GIA-002',diamond:'0.32ct · G · VS1',price:12850000,status:'AVAILABLE'},
   {serial:'SV003',barcode:'SV003',sku:'LUM-DIA-11',size:'11',weight:'2.08g',certificate:'GIA-003',diamond:'0.28ct · F · VVS2',price:12100000,status:'RESERVED'}
 ]},
 {id:'P006',name:'Vòng Tay Tennis Bạc',cat:'BRACELET',mode:'quick',attributes:['size'],displayPrice:2800000,promo:'Combo -10%',
  variants:[
   {id:'V030',sku:'VT-TEN-16',size:'16cm',material:'Bạc 925',color:'Trắng',price:2800000,stock:4,status:'AVAILABLE'},
   {id:'V031',sku:'VT-TEN-17',size:'17cm',material:'Bạc 925',color:'Trắng',price:2800000,stock:2,status:'AVAILABLE'},
   {id:'V032',sku:'VT-TEN-18',size:'18cm',material:'Bạc 925',color:'Trắng',price:2900000,stock:0,status:'OUT_OF_STOCK'}
 ]},
 {id:'P007',name:'Vòng Cổ Mặt Trăng',cat:'NECKLACE',mode:'single',displayPrice:1650000,promo:null,
  variants:[{id:'V040',sku:'VC-MT-001',barcode:'893000000040',material:'Bạc 925',color:'Trắng',size:'45cm',price:1650000,stock:6,status:'AVAILABLE'}]},
 {id:'P008',name:'Bộ Trang Sức Blossom',cat:'SET',mode:'variant',attributes:['material','color'],displayPrice:6800000,promo:'Set -12%',
  variants:[
   {id:'V050',sku:'SET-BLO-925-W',material:'Bạc 925',color:'Trắng',size:null,price:6800000,stock:2,status:'AVAILABLE'},
   {id:'V051',sku:'SET-BLO-10K-Y',material:'Vàng 10K',color:'Vàng',size:null,price:14900000,stock:1,status:'AVAILABLE'},
   {id:'V052',sku:'SET-BLO-18K-R',material:'Vàng 18K',color:'Hồng',size:null,price:22900000,stock:0,status:'OUT_OF_STOCK'}
 ]},
 {id:'P009',name:'Hộp Quà Premium',cat:'GIFT_BOX',mode:'single',displayPrice:180000,promo:'Quà tặng',
  variants:[{id:'V060',sku:'BOX-PRM-001',barcode:'893000000060',material:'Da PU',color:'Xanh Seva',size:null,price:180000,stock:20,status:'AVAILABLE'}]},
 {id:'P010',name:'Dây Chuyền Mảnh 45cm',cat:'CHAIN',mode:'single',displayPrice:750000,promo:null,
  variants:[{id:'V070',sku:'DAY-M-45',barcode:'893000000070',material:'Bạc 925',color:'Trắng',size:'45cm',price:750000,stock:0,status:'OUT_OF_STOCK'}]}
];
const ATTR_LABEL={material:'Chất liệu',color:'Màu',size:'Kích thước'};
const STATUS_LABEL={AVAILABLE:'Còn hàng',RESERVED:'Đang giữ',SOLD:'Đã bán',DAMAGED:'Hàng lỗi',OUT_OF_STOCK:'Hết hàng'};

/* ============================================================
   21.5 KHÁCH HÀNG
   ============================================================ */
const TIER_LABEL={GOLD:'Gold',SILVER:'Silver',PLATINUM:'Platinum',MEMBER:'Member'};
const TIER_CLASS={GOLD:'tier-gold',PLATINUM:'tier-plat',SILVER:'tier-silver',MEMBER:'tier-new'};
const CUSTOMERS=[
 {id:'CUS-0001',mem:'MEM-B1-0001',name:'Nguyễn Thị Lan Anh',phone:'0901234567',phoneDisplay:'0901 *** 567',tier:'GOLD',points:4520,spend:28650000,status:'ACTIVE',canEarn:true,canRedeem:true,canVoucher:true},
 {id:'CUS-0002',mem:'MEM-B1-0002',name:'Trần Quốc Bảo',phone:'0912345678',phoneDisplay:'0912 *** 678',tier:'SILVER',points:920,spend:8100000,status:'ACTIVE',canEarn:true,canRedeem:true,canVoucher:true},
 {id:'CUS-0003',mem:'MEM-B1-0003',name:'Lê Hoàng Yến',phone:'0987654321',phoneDisplay:'0987 *** 321',tier:'MEMBER',points:120,spend:1850000,status:'SUSPENDED',statusReason:'Tài khoản đang được xác minh',canEarn:false,canRedeem:false,canVoucher:false},
 {id:'CUS-0004',mem:null,name:'Phạm Ngọc Linh',phone:'0905556677',phoneDisplay:'0905 *** 677',tier:null,points:0,spend:450000,status:'CUSTOMER_ONLY',canEarn:false,canRedeem:false,canVoucher:false},
 {id:'CUS-0005',mem:'MEM-B1-0005',name:'Đỗ Minh Khang',phone:'0909998888',phoneDisplay:'0909 *** 888',tier:'PLATINUM',points:12800,spend:96500000,status:'FRAUD_REVIEW',statusReason:'Giao dịch bất thường',canEarn:false,canRedeem:false,canVoucher:false}
];
const CUST_STATUS_WARN={
 SUSPENDED:'Tạm khóa · Không tích điểm & ưu đãi',
 FRAUD_REVIEW:'Đang rà soát giao dịch · Khóa điểm & voucher',
 CUSTOMER_ONLY:'Khách thường · Chưa là thành viên'
};

/* ============================================================
   21.6 VOUCHER + KHUYẾN MẠI
   ============================================================ */
// promotion theo dòng: giảm % 1 sản phẩm cụ thể, giới hạn số lượng
const PROMOTIONS=[
 {id:'PROMO-001',name:'Charm Bướm giảm 20%',type:'PRODUCT_PERCENT',value:20,skus:['CH-BM-001'],maxQty:1}
];
const VOUCHERS=[
 {code:'SEVA200',name:'Giảm 200.000đ',type:'ORDER_FIXED',value:200000,minOrder:3000000,status:'VALID',scope:'ALL'},
 {code:'GOLD500',name:'Ưu đãi Gold 500.000đ',type:'ORDER_FIXED',value:500000,minOrder:8000000,status:'VALID',scope:'GOLD_AND_ABOVE'},
 {code:'EXPIRED50',name:'Giảm 50%',type:'ORDER_PERCENT',value:50,status:'EXPIRED',scope:'ALL'}
];

/* ============================================================
   STATE
   ============================================================ */
let currentStoreCode=SESSION.store;
// 3 giỏ mẫu (21.7). items lưu tối giản; giá/nhãn suy ra từ product.
let carts=[
 {id:4,seller:'Nguyễn Minh',sellerId:'NV-A001',time:'09:18',items:[],customer:null,synced:true,lookup:null,voucher:null},
 {id:6,seller:'Nguyễn Thị Thái Hòa',sellerId:'NV-A002',time:'10:46',
  customer:CUSTOMERS[0],synced:true,lookup:null,voucher:'SEVA200',
  items:[
   {productId:'P003',variantId:'V012',qty:1},
   {productId:'P002',variantId:'V002',qty:2},
   {productId:'P005',serial:'SV001',qty:1}
  ]},
 {id:7,seller:'Lê Thị Bảo Trân',sellerId:'NV-A003',time:'10:58',customer:null,synced:false,lookup:null,voucher:null,
  items:[{productId:'P007',variantId:'V040',qty:1}]}
];
let activeCartId=6, nextCartId=8;
let activeCat='ALL', inStockOnly=false, searchTerm='', offline=false;
let pendingCustCartId=null, selCtx=null;
let pay=null;
let orderSeq=52;

/* ============================================================
   HELPERS
   ============================================================ */
const el=id=>document.getElementById(id);
const fmt=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const fmtNum=n=>Math.round(n).toLocaleString('vi-VN');
const getCart=()=>carts.find(c=>c.id===activeCartId);
const store=()=>STORES.find(s=>s.code===currentStoreCode);
const prod=id=>PRODUCTS.find(p=>p.id===id);
const now=()=>new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
const initials=name=>name.trim().split(/\s+/).pop()[0];
const shortName=name=>{const p=name.trim().split(/\s+/);return p.length<=2?name:p.slice(-2).join(' ');};

function toast(msg,type=''){
  const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;
  el('toasts').appendChild(t);setTimeout(()=>t.remove(),2600);
}
function openModal(id){el(id).classList.add('show');}
function closeModal(id){el(id).classList.remove('show');}

// tồn kho khả dụng của 1 sản phẩm (tổng)
function productStock(p){
  if(p.mode==='serialized')return p.items.filter(i=>i.status==='AVAILABLE').length;
  return p.variants.filter(v=>v.status==='AVAILABLE').reduce((s,v)=>s+v.stock,0);
}
function productMinPrice(p){
  const arr=p.mode==='serialized'?p.items.map(i=>i.price):p.variants.map(v=>v.price);
  return Math.min(...arr);
}
function productVariantCount(p){return p.mode==='serialized'?p.items.length:p.variants.length;}

/* ---- Thông tin 1 dòng giỏ (name, price, sku, variant summary, promo) ---- */
function lineInfo(it){
  const p=prod(it.productId);
  if(!p)return {name:it.name||'',price:0,sku:'',summary:'',emoji:'📦',cat:'',productId:it.productId};
  if(it.serial){
    const item=p.items.find(i=>i.serial===it.serial)||{};
    return {name:p.name,price:item.price||0,sku:item.sku||'',
      summary:`Serial ${item.serial} · Size ${item.size} · ${item.weight} · ${item.certificate}`,
      emoji:CAT_EMOJI[p.cat],cat:p.cat,serial:it.serial,productId:p.id};
  }
  const v=p.variants.find(x=>x.id===it.variantId)||p.variants[0];
  const attrs=(p.attributes||[]).map(a=>a==='size'?'Size '+v.size:v[a]).filter(Boolean);
  // sản phẩm single: hiện chất liệu + size nếu có
  let summary=attrs.join(' · ');
  if(!summary){summary=[v.material,v.size].filter(Boolean).join(' · ');}
  return {name:p.name,price:v.price,sku:v.sku,summary,emoji:CAT_EMOJI[p.cat],cat:p.cat,productId:p.id,variantId:v.id};
}

/* ============================================================
   TOTALS + PROMOTION theo dòng + VOUCHER
   ============================================================ */
// Tính giảm giá promotion cho 1 dòng: trả {discount, promoLabel}
function linePromotion(it){
  const info=lineInfo(it);
  const promo=PROMOTIONS.find(pr=>pr.skus&&pr.skus.includes(info.sku));
  if(!promo)return {discount:0,promoLabel:''};
  // PRODUCT_PERCENT: chỉ áp cho maxQty đơn vị, phần còn lại giá gốc
  const applyQty=Math.min(it.qty,promo.maxQty||it.qty);
  const perUnit=Math.round(info.price*promo.value/100);
  return {discount:perUnit*applyQty,promoLabel:promo.name,applyQty,perUnit};
}
function cartTotals(c){
  let sub=0,promoTotal=0;
  c.items.forEach(it=>{
    const info=lineInfo(it);
    sub+=info.price*it.qty;
    promoTotal+=linePromotion(it).discount;
  });
  // voucher
  let voucherTotal=0,voucherCode=null;
  if(c.voucher){
    const v=VOUCHERS.find(x=>x.code===c.voucher);
    const afterPromo=sub-promoTotal;
    if(v&&v.status==='VALID'&&(!v.minOrder||afterPromo>=v.minOrder)){
      voucherCode=v.code;
      voucherTotal=v.type==='ORDER_FIXED'?v.value:Math.round(afterPromo*v.value/100);
    }
  }
  const total=Math.max(0,sub-promoTotal-voucherTotal);
  return {sub,promoTotal,voucherTotal,voucherCode,total};
}

/* ============================================================
   STORE SWITCHER
   ============================================================ */
function toggleStorePop(e){
  e.stopPropagation();
  const pop=el('storePop');const opening=!pop.classList.contains('show');
  pop.classList.toggle('show',opening);
  if(opening)renderStorePop();
}
function renderStorePop(){
  el('storePop').innerHTML=STORES.map(s=>{
    const on=s.code===currentStoreCode;
    const statusTxt=s.online?'Đang mở':'Mất kết nối';
    return `<div class="pop-item ${on?'sel':''}" onclick="selectStore('${s.code}')">
      <div class="store-pop-main">
        <div class="pn">${s.name}</div>
        <div class="pr">${s.brand} · ${STORE_TYPE_LABEL[s.type]} · ${statusTxt}</div>
        <div class="pr">${s.address}</div>
      </div>
      <span class="pchk">✓</span>
    </div>`;
  }).join('');
}
function selectStore(code){
  if(code===currentStoreCode){el('storePop').classList.remove('show');return;}
  // Không cho đổi điểm bán khi còn giỏ chưa hoàn tất (có sản phẩm)
  const hasOpen=carts.some(c=>c.items.length>0);
  if(hasOpen){toast('Không thể đổi điểm bán khi còn giỏ hàng chưa hoàn tất','err');el('storePop').classList.remove('show');return;}
  currentStoreCode=code;
  el('storePop').classList.remove('show');
  renderStoreHeader();
  const s=store();
  // đồng bộ trạng thái online theo store
  offline=!s.online;applyConnState();
  toast('Đã chuyển sang '+s.short,'ok');
}
function renderStoreHeader(){
  const s=store();
  el('storeBtn').innerHTML=`${s.short} · ${STORE_TYPE_LABEL[s.type]} <span class="caret">▼</span>`;
}

/* ============================================================
   CATEGORY + PRODUCT GRID
   ============================================================ */
function renderCats(){
  el('catStrip').innerHTML=CATS.map(c=>
    `<button class="cat ${c.id===activeCat?'active':''}" onclick="setCat('${c.id}')">${c.name}</button>`).join('');
}
function setCat(id){activeCat=id;renderCats();renderProducts();}

function filteredProducts(){
  return PRODUCTS.filter(p=>{
    if(activeCat!=='ALL'&&p.cat!==activeCat)return false;
    if(inStockOnly&&productStock(p)<=0)return false;
    if(searchTerm){
      const q=searchTerm.toLowerCase();
      const skus=(p.variants||p.items).map(v=>v.sku).join(' ').toLowerCase();
      if(!p.name.toLowerCase().includes(q)&&!skus.includes(q))return false;
    }
    return true;
  });
}
function stockBadge(p){
  const s=productStock(p);
  if(s<=0)return '<span class="badge b-out">Hết hàng</span>';
  if(s<=3)return '<span class="badge b-low">Sắp hết</span>';
  return '<span class="badge b-in">Còn hàng</span>';
}
function renderProducts(){
  const list=filteredProducts();
  el('resCount').textContent=list.length;
  if(!list.length){
    el('productGrid').innerHTML=`<div class="grid-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <div class="grid-empty-title">Không tìm thấy sản phẩm</div>
      <div>Thử đổi từ khóa, danh mục hoặc bỏ bộ lọc "Còn hàng".</div></div>`;
    return;
  }
  el('productGrid').innerHTML=list.map(productCard).join('');
}
// CTA + metadata theo mode
function productCard(p){
  const stock=productStock(p),oos=stock<=0;
  const ctaMap={single:'+ Thêm vào giỏ',quick:'Chọn size',variant:'Chọn biến thể',serialized:'Chọn sản phẩm'};
  const cta=ctaMap[p.mode];
  const v0=p.mode==='serialized'?p.items[0]:p.variants[0];
  // metadata dòng phụ
  let meta='';
  if(p.mode==='single')meta=v0.sku;
  else if(p.mode==='quick')meta=productVariantCount(p)+' size';
  else if(p.mode==='variant')meta=productVariantCount(p)+' biến thể';
  else meta=stock+' món khả dụng';
  const mat=p.mode==='single'?(v0.material||''):(p.attributes?p.attributes.map(a=>ATTR_LABEL[a]).join(' · '):'Theo món thực tế');
  // giá: single hiện giá (áp KM nếu có promotion theo sku); nhiều biến thể hiện "Từ"
  let priceHtml;
  if(p.mode==='single'){
    const promo=PROMOTIONS.find(pr=>pr.skus&&pr.skus.includes(v0.sku));
    if(promo){const disc=Math.round(v0.price*promo.value/100);
      priceHtml=`<span class="price">${fmt(v0.price-disc)}</span><span class="price-old">${fmt(v0.price)}</span>`;
    } else priceHtml=`<span class="price">${fmt(v0.price)}</span>`;
  } else {
    priceHtml=`<span class="price-from">${p.pricePrefix||'Từ'}</span> <span class="price">${fmt(productMinPrice(p))}</span>`;
  }
  const clickAdd=p.mode==='single'?`addSingle('${p.id}')`:`handleAddProduct('${p.id}')`;
  return `<div class="product-card ${oos?'oos':''}">
      <div class="product-card__media" onclick="${clickAdd}">
        <span class="pc-emoji">${CAT_EMOJI[p.cat]}</span>
        ${stockBadge(p)}
        ${p.promo?`<span class="badge-promo">${p.promo}</span>`:''}
      </div>
      <div class="product-card__body">
        <div class="card-sku">${meta}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-mat">${mat}</div>
        <div class="card-price">${priceHtml}</div>
        <button class="card-add" ${oos?'disabled':''} onclick="${clickAdd}">${oos?'Hết hàng':cta}</button>
      </div></div>`;
}

/* ============================================================
   CART TABS
   ============================================================ */
function renderTabs(){
  el('cartTabs').innerHTML=carts.map(c=>{
    const count=c.items.reduce((s,i)=>s+i.qty,0);
    return `<div class="tab ${c.id===activeCartId?'active':''}" onclick="switchCart(${c.id})">
      ${!c.synced?'<span class="tab-warn" title="Chưa đồng bộ"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></span>':''}
      <span class="tab-num">#${c.id}</span><span class="tab-sep">·</span><span class="tab-emp">${shortName(c.seller)}</span>${count?`<span class="tab-badge">${count}</span>`:''}
      <button class="tab-close" onclick="event.stopPropagation();closeCart(${c.id})" aria-label="Đóng giỏ">✕</button>
    </div>`;
  }).join('')+`<button class="tab-new" onclick="newCart()" title="Tạo giỏ mới">+ Giỏ</button>`;
}
function switchCart(id){activeCartId=id;pay=null;renderTabs();renderCartPanel();}
function newCart(){
  if(carts.length>=5){toast('Tối đa 5 giỏ','err');return;}
  carts.push({id:nextCartId,seller:CURRENT_USER.name,sellerId:CURRENT_USER.id,time:now(),items:[],customer:null,synced:!offline,lookup:null,voucher:null});
  activeCartId=nextCartId;nextCartId++;pay=null;
  renderTabs();renderCartPanel();
  toast('Đã mở Giỏ #'+(nextCartId-1)+' · Người bán '+shortName(CURRENT_USER.name),'ok');
}
function closeCart(id){
  const c=carts.find(x=>x.id===id);
  if(c.items.length&&!confirm(`Giỏ #${id} còn ${c.items.length} sản phẩm. Xác nhận hủy giỏ?`))return;
  carts=carts.filter(x=>x.id!==id);
  if(!carts.length){carts.push({id:nextCartId++,seller:CURRENT_USER.name,sellerId:CURRENT_USER.id,time:now(),items:[],customer:null,synced:true,lookup:null,voucher:null});}
  if(activeCartId===id)activeCartId=carts[0].id;
  pay=null;renderTabs();renderCartPanel();toast('Đã đóng giỏ #'+id);
}

/* ============================================================
   SELLER POPOVER
   ============================================================ */
function toggleSellerPopover(e){
  e.stopPropagation();
  const pop=el('sellerPop');const opening=!pop.classList.contains('show');
  pop.classList.toggle('show',opening);
  if(opening){el('sellerSearchPop').value='';renderSellerPop('');setTimeout(()=>el('sellerSearchPop').focus(),30);}
}
function toggleCartMenu(e){e.stopPropagation();const m=el('cartMenu');if(m)m.classList.toggle('show');}
function closeCartMenu(){const m=el('cartMenu');if(m)m.classList.remove('show');}
function toggleCustMenu(e){e.stopPropagation();const m=el('custMenu');if(m)m.classList.toggle('show');}
function closeCustMenu(){const m=el('custMenu');if(m)m.classList.remove('show');}
function viewCustomer(){const cu=getCart().customer;if(!cu)return;
  toast(`${cu.name} · ${TIER_LABEL[cu.tier]||'Khách'} · ${cu.phoneDisplay} · ${fmtNum(cu.points)} điểm · Tổng chi ${fmt(cu.spend)}`);}
function renderSellerPop(q){
  const c=getCart();
  const list=SELLERS.filter(s=>s.name.toLowerCase().includes(q.toLowerCase()));
  el('sellerPopList').innerHTML=list.length?list.map(s=>
    `<div class="pop-item ${s.id===c.sellerId?'sel':''}" onclick="selectSeller('${s.id}')">
      <div class="pa">${s.avatar}</div><span class="pn">${s.name}</span><span class="pchk">✓</span>
    </div>`).join(''):'<div style="padding:10px;font-size:13px;color:var(--text-2)">Không tìm thấy.</div>';
}
function selectSeller(id){
  const s=SELLERS.find(x=>x.id===id);if(!s)return;
  const c=getCart();
  if(c.items.length&&s.id!==c.sellerId&&!confirm(`Giỏ #${c.id} đang có ${c.items.length} sản phẩm. Đổi người bán sang ${s.name}?`)){return;}
  c.seller=s.name;c.sellerId=s.id;
  el('sellerPop').classList.remove('show');
  renderTabs();renderCartPanel();
  toast('Người bán giỏ #'+c.id+': '+shortName(s.name),'ok');
}

/* ============================================================
   THÊM SẢN PHẨM VÀO GIỎ (giỏ nguồn)
   ============================================================ */
function pushToCart(cartId,item){
  const cart=carts.find(c=>c.id===cartId)||getCart();
  lastAddedKey=item.serial?('s:'+item.serial):(item.productId+':'+item.variantId);
  if(!item.serial){
    const ex=cart.items.find(i=>i.productId===item.productId&&i.variantId===item.variantId&&!i.serial);
    if(ex){ex.qty++;cart.synced=!offline;afterAdd(cart,item.name,true);return;}
  }
  cart.items.push(Object.assign({qty:1},item));
  cart.synced=!offline;afterAdd(cart,item.name);
}
function afterAdd(cart,name,qtyBumped){
  // Nếu đang duyệt catalog: đóng drawer, quay lại cart workspace
  const cat=el('catalogDrawer');
  if(cat&&cat.classList.contains('show')){el('catalogScrim').classList.remove('show');cat.classList.remove('show');}
  renderTabs();renderCartPanel();
  setTimeout(()=>{lastAddedKey=null;},1200);
  const si=el('searchInput');if(si){si.focus();si.select&&si.select();}
  toast(`${qtyBumped?'Tăng số lượng':'Đã thêm'} ${name} → Giỏ #${cart.id}`,'ok');
}
// sản phẩm single -> thêm thẳng
function addSingle(pid){
  const p=prod(pid);const v=p.variants[0];
  if(v.status!=='AVAILABLE'||v.stock<=0){toast(p.name+' đã hết hàng','err');return;}
  pushToCart(activeCartId,{productId:p.id,variantId:v.id,name:p.name});
}
// HÀM TRUNG TÂM cho sản phẩm nhiều biến thể/serial
function handleAddProduct(pid){
  const p=prod(pid);if(!p)return;const src=activeCartId;
  if(p.mode==='single'){addSingle(pid);return;}
  if(p.mode==='serialized'){
    if(!p.items.some(i=>i.status==='AVAILABLE')){toast(p.name+' hết hàng','err');return;}
    openSerialDrawer(p,src);return;
  }
  const inStock=p.variants.filter(v=>v.status==='AVAILABLE'&&v.stock>0);
  if(!inStock.length){toast(p.name+' hết hàng','err');return;}
  if(inStock.length===1){
    addVariantToCart(p,inStock[0],src);
    toast('Đã thêm biến thể duy nhất còn hàng vào Giỏ #'+src,'ok');return;
  }
  if(p.mode==='quick')openQuickPopover(p,src);
  else openVariantDrawer(p,src);
}
function addVariantToCart(p,v,cartId){pushToCart(cartId,{productId:p.id,variantId:v.id,name:p.name});}
function addSerialToCart(p,it,cartId){pushToCart(cartId,{productId:p.id,serial:it.serial,name:p.name});}

function chgQty(idx,d){
  const c=getCart();const it=c.items[idx];it.qty+=d;
  if(it.qty<=0)c.items.splice(idx,1);
  c.synced=!offline;renderTabs();renderCartPanel();
}
function delItem(idx){const c=getCart();c.items.splice(idx,1);c.synced=!offline;renderTabs();renderCartPanel();}
function clearCart(){if(confirm('Xóa tất cả sản phẩm trong giỏ #'+activeCartId+'?')){getCart().items=[];renderTabs();renderCartPanel();toast('Đã xóa toàn bộ giỏ');}}

/* ============================================================
   VARIANT SELECTOR (quick popover / variant drawer / serial)
   ============================================================ */
function openQuickPopover(p,src){selCtx={p,sourceCartId:src,picked:null};renderQuickPopover();el('vsScrim').classList.add('show');}
function renderQuickPopover(){
  const {p,picked}=selCtx;
  const opts=p.variants.map(v=>{
    const oos=v.status!=='AVAILABLE'||v.stock<=0;const sel=picked&&picked.id===v.id;
    return `<button class="opt ${sel?'sel':''}" ${oos?'disabled':''} onclick="quickPick('${v.id}')">${v.size}${oos?'<span class="opt-x">Hết</span>':''}</button>`;
  }).join('');
  const detail=picked?`<div class="vs-detail">
      <div class="vs-drow"><span>Size ${picked.size}</span></div>
      <div class="vs-drow"><span class="k">SKU</span><span>${picked.sku}</span></div>
      <div class="vs-drow"><span class="k">Tồn</span><span>${picked.stock}</span></div>
      <div class="vs-drow big"><span class="k">Giá</span><span>${fmt(picked.price)}</span></div>
    </div>`:`<div class="vs-hint">Chọn kích thước để xem giá & tồn.</div>`;
  el('vsPopover').innerHTML=`
    <div class="vs-pop-head"><div><div class="vs-title">${p.name}</div><div class="vs-sub">Chọn kích thước</div></div>
      <button class="vs-close" onclick="closeSelector()">✕</button></div>
    <div class="vs-note">Sẽ thêm vào <strong>Giỏ #${selCtx.sourceCartId}</strong></div>
    <div class="opt-grid">${opts}</div>
    ${detail}
    <div class="vs-actions">
      <button class="mbtn mbtn-ghost" onclick="closeSelector()">Hủy</button>
      <button class="mbtn mbtn-primary" ${picked?'':'disabled'} onclick="confirmQuick()">Thêm vào giỏ</button>
    </div>`;
}
function quickPick(vid){selCtx.picked=selCtx.p.variants.find(v=>v.id===vid);renderQuickPopover();}
function confirmQuick(){if(!selCtx.picked)return;addVariantToCart(selCtx.p,selCtx.picked,selCtx.sourceCartId);closeSelector();}

function openVariantDrawer(p,src){selCtx={p,sourceCartId:src,sel:{}};renderVariantDrawer();el('vsDrawer').classList.add('show');el('vsDrawerScrim').classList.add('show');}
function matchVariant(p,sel){return p.variants.find(v=>p.attributes.every(a=>sel[a]===v[a]));}
function optionEnabled(p,attr,val,sel){
  return p.variants.some(v=>v[attr]===val&&p.attributes.every(a=>a===attr||!sel[a]||sel[a]===v[a]));
}
function optionHasStock(p,attr,val,sel){
  return p.variants.some(v=>v[attr]===val&&v.status==='AVAILABLE'&&v.stock>0&&p.attributes.every(a=>a===attr||!sel[a]||sel[a]===v[a]));
}
function renderVariantDrawer(){
  const {p,sel}=selCtx;
  const groups=p.attributes.map(attr=>{
    const vals=[...new Set(p.variants.map(v=>v[attr]))];
    const opts=vals.map(val=>{
      const enabled=optionEnabled(p,attr,val,sel);
      const hasStock=optionHasStock(p,attr,val,sel);
      const disabled=!enabled||!hasStock;const seld=sel[attr]===val;
      return `<button class="opt ${seld?'sel':''}" ${disabled?'disabled':''} onclick="variantPick('${attr}','${val}')">${val}${(!hasStock&&enabled)?'<span class="opt-x">Hết</span>':''}</button>`;
    }).join('');
    return `<div class="vs-group"><div class="vs-glabel">${ATTR_LABEL[attr]}</div><div class="opt-grid">${opts}</div></div>`;
  }).join('');
  const v=matchVariant(p,sel);
  const chosen=p.attributes.filter(a=>sel[a]).map(a=>a==='size'?'Size '+sel[a]:sel[a]).join(' · ');
  const detail=v?`<div class="vs-detail">
      <div class="vs-drow"><span class="k">Biến thể</span><span>${chosen}</span></div>
      <div class="vs-drow"><span class="k">SKU</span><span>${v.sku}</span></div>
      <div class="vs-drow"><span class="k">Tồn tại cửa hàng</span><span>${v.stock}</span></div>
      <div class="vs-drow big"><span class="k">Giá</span><span>${fmt(v.price)}</span></div>
    </div>`:`<div class="vs-hint">${chosen?'Đã chọn: '+chosen+' — chọn nốt thuộc tính còn lại.':'Chọn theo thứ tự: '+p.attributes.map(a=>ATTR_LABEL[a]).join(' → ')}</div>`;
  const canAdd=!!(v&&v.status==='AVAILABLE'&&v.stock>0);
  el('vsDrawer').innerHTML=`
    <div class="vs-dhead">
      <div><div class="vs-title">${p.name}</div><div class="vs-note">Sẽ thêm vào <strong>Giỏ #${selCtx.sourceCartId}</strong></div></div>
      <button class="vs-close" onclick="closeSelector()">✕</button>
    </div>
    <div class="vs-dbody">
      <div class="vs-img">${CAT_EMOJI[p.cat]}</div>
      ${groups}
      ${detail}
    </div>
    <div class="vs-dfoot">
      <button class="mbtn mbtn-ghost" onclick="clearVariantSel()">Xóa lựa chọn</button>
      <button class="mbtn mbtn-primary" ${canAdd?'':'disabled'} onclick="confirmVariant()">Thêm vào giỏ</button>
    </div>`;
}
function variantPick(attr,val){
  const sel=selCtx.sel,p=selCtx.p;
  sel[attr]=sel[attr]===val?undefined:val;
  p.attributes.forEach(a=>{if(sel[a]&&!optionEnabled(p,a,sel[a],sel))sel[a]=undefined;});
  renderVariantDrawer();
}
function clearVariantSel(){selCtx.sel={};renderVariantDrawer();}
function confirmVariant(){const v=matchVariant(selCtx.p,selCtx.sel);if(!v||v.status!=='AVAILABLE'||v.stock<=0)return;addVariantToCart(selCtx.p,v,selCtx.sourceCartId);closeSelector();}

function openSerialDrawer(p,src){selCtx={p,sourceCartId:src,serial:null};renderSerialDrawer();el('vsDrawer').classList.add('show');el('vsDrawerScrim').classList.add('show');}
function renderSerialDrawer(){
  const {p,serial}=selCtx;
  const rows=p.items.map(it=>{
    const avail=it.status==='AVAILABLE';const sel=serial===it.serial;
    return `<button class="serial-item ${sel?'sel':''}" ${avail?'':'disabled'} onclick="serialPick('${it.serial}')">
      <span class="radio ${sel?'on':''}"></span>
      <div class="serial-info">
        <div class="serial-top">Serial ${it.serial} <span class="serial-status ${it.status.toLowerCase()}">${STATUS_LABEL[it.status]}</span></div>
        <div class="serial-sub">Size ${it.size} · ${it.weight} · ${it.certificate}</div>
        <div class="serial-sub">${it.diamond||''}</div>
      </div>
      <div class="serial-price">${fmt(it.price)}</div>
    </button>`;
  }).join('');
  el('vsDrawer').innerHTML=`
    <div class="vs-dhead">
      <div><div class="vs-title">Chọn sản phẩm thực tế</div><div class="vs-sub">${p.name}</div>
        <div class="vs-note">Sẽ thêm vào <strong>Giỏ #${selCtx.sourceCartId}</strong></div></div>
      <button class="vs-close" onclick="closeSelector()">✕</button>
    </div>
    <div class="vs-dbody">${rows}</div>
    <div class="vs-dfoot">
      <button class="mbtn mbtn-ghost" onclick="closeSelector()">Hủy</button>
      <button class="mbtn mbtn-primary" ${serial?'':'disabled'} onclick="confirmSerial()">Thêm sản phẩm</button>
    </div>`;
}
function serialPick(sn){selCtx.serial=sn;renderSerialDrawer();}
function confirmSerial(){const it=selCtx.p.items.find(i=>i.serial===selCtx.serial);if(!it||it.status!=='AVAILABLE')return;addSerialToCart(selCtx.p,it,selCtx.sourceCartId);closeSelector();}

function closeSelector(){selCtx=null;el('vsScrim').classList.remove('show');el('vsDrawer').classList.remove('show');el('vsDrawerScrim').classList.remove('show');}

/* ============================================================
   KHÁCH HÀNG
   ============================================================ */
function renderCustomer(c){
  if(c.customer){
    const cu=c.customer;
    const warn=CUST_STATUS_WARN[cu.status];
    const tierBadge=cu.tier?`<span class="tier ${TIER_CLASS[cu.tier]}">${TIER_LABEL[cu.tier]}</span>`:'';
    return `<div class="cust-card">
        <div class="cust-info">
          <div class="cust-name">${cu.name} ${tierBadge}</div>
          <div class="cust-sub">${cu.phoneDisplay} · ${fmtNum(cu.points)} điểm</div>
        </div>
        <div class="cust-menu-wrap">
          <button class="ch-icon" title="Tùy chọn khách" onclick="toggleCustMenu(event)"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
          <div class="menu-pop" id="custMenu">
            <button class="menu-item" onclick="closeCustMenu();changeCustomer()">Đổi khách</button>
            <button class="menu-item" onclick="closeCustMenu();viewCustomer()">Xem thông tin</button>
            <button class="menu-item danger" onclick="closeCustMenu();removeCustomer()">Gỡ khách</button>
          </div>
        </div>
      </div>
      ${warn?`<div class="cust-warn">⚠ ${warn}${cu.statusReason?' — '+cu.statusReason:''}</div>`:''}`;
  }
  let html=`<div class="cust-empty">
      <input class="cust-input" id="custLookup" placeholder="Tìm bằng SĐT hoặc mã thành viên... (F4)" autocomplete="off"
             onkeydown="if(event.key==='Enter')lookupCustomer()">
      <button class="cust-add" title="Tạo khách mới" onclick="openCustModal()">+</button>
    </div>`;
  if(c.lookup){
    const cu=c.lookup;
    const tierBadge=cu.tier?`<span class="tier ${TIER_CLASS[cu.tier]}">${TIER_LABEL[cu.tier]}</span>`:'';
    const warn=CUST_STATUS_WARN[cu.status];
    html+=`<div class="cust-result">
        <div class="cust-av">${initials(cu.name)}</div>
        <div class="cust-result-info">
          <div class="cust-name">${cu.name} ${tierBadge}</div>
          <div class="cust-sub">${cu.phoneDisplay} · ${fmtNum(cu.points)} điểm</div>
          ${warn?`<div class="cust-sub" style="color:var(--warning)">${warn}</div>`:''}
        </div>
        <button class="cust-choose" onclick="chooseCustomer()">Chọn</button>
      </div>`;
  }
  return html;
}
function lookupCustomer(){
  if(offline){toast('Không thể tra cứu Loyalty khi offline','err');return;}
  const q=el('custLookup').value.trim();
  if(!q){toast('Nhập SĐT hoặc mã thành viên','err');return;}
  const cu=CUSTOMERS.find(c=>c.phone===q||c.phone.includes(q)||c.mem===q||c.name.toLowerCase().includes(q.toLowerCase()));
  const c=getCart();
  if(!cu){c.lookup=null;renderCartPanel();toast('Không tìm thấy khách hàng','err');return;}
  c.lookup=cu;renderCartPanel();
}
function chooseCustomer(){const c=getCart();c.customer=c.lookup;c.lookup=null;renderCartPanel();
  const w=CUST_STATUS_WARN[c.customer.status];
  toast(w?('Đã gắn khách — '+w):('Đã gắn khách: '+c.customer.name),w?'':'ok');}
function changeCustomer(){const c=getCart();c.customer=null;c.lookup=null;renderCartPanel();setTimeout(()=>{const l=el('custLookup');if(l)l.focus();},50);}
function removeCustomer(){const c=getCart();c.customer=null;c.lookup=null;renderCartPanel();toast('Đã gỡ khách');}

function openCustModal(){
  if(offline){toast('Không thể tạo khách mới khi offline','err');return;}
  pendingCustCartId=activeCartId;
  el('custPhone').value='';el('custName').value='';el('custDob').value='';el('custGender').value='';
  el('custStatus').classList.remove('show');
  document.querySelectorAll('#custScrim .merr').forEach(e=>e.classList.remove('show'));
  el('custConfirm').disabled=false;
  openModal('custScrim');setTimeout(()=>el('custPhone').focus(),50);
}
function createCustomer(){
  const phone=el('custPhone').value.trim().replace(/\s/g,''),name=el('custName').value.trim();
  const pe=el('custPhoneErr'),ne=el('custNameErr');pe.classList.remove('show');ne.classList.remove('show');
  let ok=true;
  if(!/^0\d{9}$/.test(phone)){pe.textContent='SĐT không hợp lệ (10 số, bắt đầu 0).';pe.classList.add('show');ok=false;}
  if(name.length<2){ne.textContent='Vui lòng nhập họ tên.';ne.classList.add('show');ok=false;}
  if(ok&&CUSTOMERS.find(c=>c.phone===phone)){pe.textContent='SĐT đã tồn tại. Dùng ô tìm để chọn khách.';pe.classList.add('show');ok=false;}
  if(!ok)return;
  const st=el('custStatus');st.className='mstatus show loading';st.textContent='Đang tạo...';
  el('custConfirm').disabled=true;
  setTimeout(()=>{
    const cu={id:'CUS-NEW',mem:'MEM-NEW',name,phone,phoneDisplay:phone.slice(0,4)+' *** '+phone.slice(-3),
      tier:'MEMBER',points:0,spend:0,status:'ACTIVE',canEarn:true,canRedeem:true,canVoucher:true};
    CUSTOMERS.push(cu);
    const target=carts.find(c=>c.id===pendingCustCartId);
    if(target){target.customer=cu;target.lookup=null;}
    el('custConfirm').disabled=false;
    closeModal('custScrim');renderCartPanel();
    toast('Đã tạo & gắn khách '+name+' vào giỏ #'+pendingCustCartId,'ok');
  },500);
}

/* ============================================================
   CART PANEL
   ============================================================ */
function renderRibbon(){
  const c=getCart();
  el('targetRibbon').innerHTML=`<span class="target-chip"><span class="tr-dot"></span>Giỏ active: <strong>#${c.id}</strong><span class="tr-emp">· ${shortName(c.seller)}</span></span>`;
}
function renderCartPanel(){
  renderRibbon();
  renderCartList();      // TRÁI: danh sách sản phẩm giỏ (LUÔN hiển thị, kể cả khi thanh toán)
  renderOrderPanel();    // PHẢI: header + khách + (summary | payment inline | success)
  cdSync();
}

/* ---------- TRÁI: danh sách sản phẩm giỏ active ---------- */
let lastAddedKey=null; // để highlight dòng vừa thêm
function renderCartList(){
  const c=getCart();
  const itemsHtml=c.items.map((it,idx)=>{
    const info=lineInfo(it);
    const lp=linePromotion(it);
    const lineBase=info.price*it.qty;
    const lineFinal=lineBase-lp.discount;
    const key=it.serial?('s:'+it.serial):(it.productId+':'+it.variantId);
    const hl=key===lastAddedKey?' just-added':'';
    return `<div class="cart-line${hl}">
      <div class="cart-line__img">${info.emoji}</div>
      <div class="cart-line__mid">
        <div class="cart-line__name">${info.name}</div>
        ${info.summary?`<div class="cart-line__variant">${info.summary}</div>`:''}
        <div class="cart-line__sku">${info.sku}${lp.discount?` · <span class="cl-promo">KM ${lp.promoLabel}</span>`:''}</div>
      </div>
      <div class="cart-line__right">
        <div class="cart-line__price">${fmt(lineFinal)}${lp.discount?`<span class="cart-line__old">${fmt(lineBase)}</span>`:''}</div>
        <div class="cart-line__ctrl">
          ${it.serial?`<span class="cl-serial">1 chiếc</span>`
            :`<div class="stepper" id="stp-${idx}"><button onclick="chgQty(${idx},-1)">−</button><span>${it.qty}</span><button onclick="chgQty(${idx},1)">+</button></div>`}
          <button class="item-del" onclick="delItem(${idx})" aria-label="Xóa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
        </div>
      </div>
    </div>`;
  }).join('');

  const emptyHtml=`<div class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 6v12M11 6v12M15 6v12M19 6v12"/></svg>
      <div class="empty-title">Quét mã sản phẩm để bắt đầu</div>
      <div class="empty-kbd">Sản phẩm sẽ được thêm vào <strong>Giỏ #${c.id}</strong></div>
      <div class="empty-kbd">Người bán: ${c.seller}</div>
      <div class="empty-kbd"><kbd>F3</kbd> — Tìm theo SKU hoặc tên sản phẩm</div>
      <button class="empty-cta" onclick="openCatalog()">Duyệt danh mục</button>
    </div>`;

  const count=c.items.reduce((s,i)=>s+i.qty,0);
  el('cartListRegion').innerHTML=`
    <div class="clw-head">
      <span class="clw-title">Sản phẩm trong Giỏ #${c.id}</span>
      <span class="clw-count">${count} SP</span>
      <button class="clw-browse" onclick="openCatalog()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Duyệt danh mục
      </button>
    </div>
    ${c.items.length?`<div class="cart-lines">${itemsHtml}</div>`:emptyHtml}
    <div class="cart-note">
      <input class="cart-note__input" id="cartNote" placeholder="Ghi chú đơn hàng..." value="${c.note||''}" oninput="setCartNote(this.value)">
    </div>`;
}
function setCartNote(v){getCart().note=v;}

/* ---------- PHẢI: thông tin đơn hàng — MỘT CỘT LIÊN TỤC ---------- */
function renderOrderPanel(){
  const c=getCart();
  const t=cartTotals(c);
  const amountDue=t.total;            // nguồn duy nhất: activeCart.total
  if(pay)pay.due=amountDue;           // đồng bộ payment.amountDue = amountDue

  // SUCCESS: thay content + footer bằng success
  if(pay&&pay.mode==='success'){
    el('cartPanel').innerHTML=`
      <div class="order-panel__content">
        ${orderHeaderHtml(c)}
        <div class="customer">${renderCustomer(c)}</div>
        ${renderSuccessInline()}
      </div>`;
    return;
  }

  // Payment LUÔN hiển thị như section tiếp theo khi giỏ có sản phẩm (không cần bấm Thanh toán)
  const hasItems=c.items.length>0;
  if(hasItems&&!pay){pay={due:amountDue,method:'cash',cashGiven:0,qrPaid:false,cardState:'idle',splitCash:0,splitBank:0};}
  el('cartPanel').innerHTML=`
    <div class="order-panel__content">
      ${orderHeaderHtml(c)}
      <div class="customer">${renderCustomer(c)}</div>
      ${summaryBlockHtml(c,t)}
      ${hasItems?`<div class="payment-section">${paymentMethodsHtml()}${paymentBodyHtml(amountDue)}</div>`:''}
    </div>
    <div class="order-panel__footer">
      ${hasItems?renderPayConfirm(amountDue):`<button class="payment-submit" disabled>Giỏ hàng trống</button>`}
    </div>`;
}
// Cart header (dòng 1: Giỏ + giờ + ⋯ ; dòng 2: NB ▼)
function orderHeaderHtml(c){
  return `<div class="cart-head">
      <div class="cart-head-top">
        <span class="cart-title">Giỏ #${c.id}</span>
        ${!c.synced?'<span class="pill pill-sync"><span class="status-dot"></span>Chưa ĐB</span>':''}
        <span class="cart-time" style="margin-left:auto">${c.time}</span>
        <div class="cart-menu-wrap">
          <button class="ch-icon" title="Tùy chọn giỏ" onclick="toggleCartMenu(event)"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
          <div class="menu-pop" id="cartMenu">
            <button class="menu-item" onclick="closeCartMenu();openSellerFromMenu()">Đổi người bán</button>
            <button class="menu-item" onclick="closeCartMenu();clearCart()">Xóa toàn bộ sản phẩm</button>
            <button class="menu-item danger" onclick="closeCartMenu();closeCart(${c.id})">Hủy giỏ #${c.id}</button>
          </div>
        </div>
      </div>
      <div class="cart-seller">
        <button class="seller-btn" onclick="toggleSellerPopover(event)"><span class="nb">NB:</span> ${shortName(c.seller)} <span class="caret">▼</span></button>
        <div class="popover" id="sellerPop">
          <input class="popover-search" id="sellerSearchPop" placeholder="Tìm người bán..." autocomplete="off" oninput="renderSellerPop(this.value)">
          <div class="pop-list" id="sellerPopList"></div>
        </div>
      </div>
    </div>`;
}
function openSellerFromMenu(){setTimeout(()=>toggleSellerPopover({stopPropagation(){}}),0);}

/* ============================================================
   ORDER SUMMARY (một block duy nhất, không card xanh)
   ============================================================ */
function summaryBlockHtml(c,t){
  return `<div class="order-summary">
      <div class="sum-row"><span>Tiền hàng</span><span>${fmt(t.sub)}</span></div>
      ${t.promoTotal?`<div class="sum-row disc"><span>Khuyến mại</span><span>-${fmt(t.promoTotal)}</span></div>`:''}
      ${t.voucherTotal?`<div class="sum-row disc"><span>Voucher ${t.voucherCode}</span><span>-${fmt(t.voucherTotal)}</span></div>`:''}
      <div class="sum-voucher">
        ${c.voucher&&t.voucherTotal
          ?`<span class="voucher-chip">${t.voucherCode}<button onclick="removeVoucher()">✕</button></span>`
          :`<button class="voucher-add" onclick="openVoucher()">+ Thêm voucher</button>`}
      </div>
      <div class="sum-total"><span class="sum-total-label">Khách cần trả</span><span class="sum-total-val">${fmt(t.total)}</span></div>
    </div>`;
}
// CTA khi CHƯA thanh toán
function checkoutCtaHtml(c,amountDue){
  return `<button class="payment-submit" id="checkoutBtn" ${c.items.length?'':'disabled'} onclick="openPayment()">
      ${pay&&pay.collapsed?'Tiếp tục thanh toán (còn dở)':'Thanh toán'}${c.items.length?' · '+fmt(amountDue):''}
    </button>`;
}
// Segmented methods (luôn hiển thị, không cần nút quay lại)
function paymentMethodsHtml(){
  return `<div class="payment-methods">
      ${methodBtn('cash','Tiền mặt')}
      ${methodBtn('qr','QR/CK')}
      ${methodBtn('card','Thẻ')}
      ${methodBtn('split','Kết hợp')}
    </div>`;
}
// Nội dung theo phương thức (không wrapper card lớn)
function paymentBodyHtml(due){
  if(pay.method==='cash')return renderCash(due);
  if(pay.method==='qr')return renderQR(due);
  if(pay.method==='card')return renderCard(due);
  if(pay.method==='split')return renderSplit(due);
  return '';
}
function openVoucher(){
  const c=getCart();const t=cartTotals(c);
  const rows=VOUCHERS.map(v=>{
    let reason='';
    if(v.status!=='VALID')reason='Đã hết hạn';
    else if(v.minOrder&&(t.sub-t.promoTotal)<v.minOrder)reason='Đơn tối thiểu '+fmt(v.minOrder);
    else if(v.scope==='GOLD_AND_ABOVE'&&!(c.customer&&['GOLD','PLATINUM'].includes(c.customer.tier)))reason='Chỉ cho hạng Gold trở lên';
    else if(v.scope!=='ALL'&&c.customer&&!c.customer.canVoucher)reason='Khách không đủ điều kiện';
    const ok=!reason;
    return `<button class="voucher-item ${ok?'':'disabled'}" ${ok?`onclick="applyVoucher('${v.code}')"`:'disabled'}>
      <div><div class="vc-name">${v.name}</div><div class="vc-code">${v.code}${reason?' · '+reason:''}</div></div>
      <span class="vc-val">${v.type==='ORDER_FIXED'?fmt(v.value):v.value+'%'}</span>
    </button>`;
  }).join('');
  el('voucherList').innerHTML=rows;
  openModal('voucherScrim');
}
function applyVoucher(code){getCart().voucher=code;closeModal('voucherScrim');renderCartPanel();toast('Đã áp voucher '+code,'ok');}
function removeVoucher(){getCart().voucher=null;renderCartPanel();toast('Đã gỡ voucher');}

/* ============================================================
   PAYMENT
   ============================================================ */
function openPayment(){
  const c=getCart();if(!c.items.length)return;
  const t=cartTotals(c);
  if(pay&&pay.collapsed){pay.collapsed=false;pay.due=t.total;} // mở lại draft đang giữ
  else pay={due:t.total,method:'cash',cashGiven:0,qrPaid:false,cardState:'idle',splitCash:0,splitBank:0};
  renderCartPanel();
}
function setMethod(m){pay.method=m;if(m==='card')pay.cardState='connecting';renderPayment();}
// renderPayment giờ chỉ re-render cả panel (payment là section inline bên trong)
function renderPayment(){renderCartPanel();
  // giữ focus ô tiền mặt sau re-render
  if(pay&&pay.method==='cash'){setTimeout(()=>{const i=el('cashInput');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},0);}
}
// Quay lại chỉnh đơn — GIỮ draft payment (pay vẫn còn), chỉ thu gọn section
function closePayment(){if(pay)pay.collapsed=true;renderCartPanel();}
// Segmented method button — compact, không icon lớn
function methodBtn(m,label){
  return `<button class="payment-method ${pay.method===m?'is-active':''}" onclick="setMethod('${m}')">${label}</button>`;
}
function renderCash(due){
  const given=pay.cashGiven;const change=given-due;
  const quicks=cashSuggestions(due);
  return `<div class="pay-field">
      <label>Khách đưa</label>
      <input class="money-input" id="cashInput" inputmode="numeric" value="${given?fmtNum(given):''}" placeholder="0" oninput="onCashInput(this.value)">
    </div>
    <div class="quick-cash">${quicks.map(q=>`<button class="quick-btn" onclick="onCashInput('${q}')">${fmtNum(q)}</button>`).join('')}</div>
    ${given===0?'':(change>=0
      ?`<div class="change-box"><span class="change-label">Tiền thừa</span><span class="change-val">${fmt(change)}</span></div>`
      :`<div class="change-box short"><span class="change-label">Còn thiếu</span><span class="change-val">${fmt(-change)}</span></div>`)}`;
}
function cashSuggestions(due){
  const set=new Set();
  [1000,10000,50000,100000].forEach(r=>{const v=Math.ceil(due/r)*r;if(v>=due)set.add(v);});
  [Math.ceil(due/100000)*100000+100000,Math.ceil(due/100000)*100000+200000].forEach(v=>set.add(v));
  return [...set].sort((a,b)=>a-b).slice(0,6);
}
function onCashInput(v){
  const n=parseInt(String(v).replace(/[^\d]/g,''))||0;
  pay.cashGiven=n;renderPayment();
  setTimeout(()=>{const i=el('cashInput');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},0);
}
function renderQR(due){
  return `<div class="qr-mini">
      <div class="qr-sm"></div>
      <div class="qr-acc">
        <div><strong>VIB</strong></div>
        <div>STK <strong>123123213</strong></div>
        <div>SEN VANG VIET NAM</div>
        <div>ND: <strong>${qrContent()}</strong></div>
      </div>
    </div>
    <button class="btn-cd" onclick="showQROnCustomer()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>
      Hiện QR cho khách
    </button>
    <div class="pay-status ${pay.qrPaid?'done':'wait'}" style="width:100%;justify-content:center"><span class="status-dot"></span>${pay.qrPaid?'Đã nhận tiền':'Đang chờ thanh toán'}</div>
    <div class="demo-row">
      <button class="demo-btn ok" onclick="markQrPaid()">Giả lập đã nhận tiền</button>
      <button class="demo-btn" onclick="pay.qrPaid=false;renderPayment();cdSync()">Thử lại</button>
    </div>`;
}
function markQrPaid(){pay.qrPaid=true;renderPayment();cdSync();}
function renderCard(due){
  const s=pay.cardState;
  const map={connecting:['conn','Đang kết nối thiết bị PAYOO...'],idle:['conn','Sẵn sàng — chờ quẹt thẻ'],
    ok:['done','Giao dịch thành công'],fail:['fail','Giao dịch thất bại — vui lòng thử lại']};
  const [cls,txt]=map[s]||map.idle;
  return `<div class="qr-wrap">
      <div style="font-size:44px;margin:8px 0">💳</div>
      <div class="qr-info"><div>Thiết bị: <strong>PAYOO-HN01-01</strong></div><div>Số tiền: <strong>${fmt(due)}</strong></div></div>
      <div class="pay-status ${cls}"><span class="status-dot"></span>${txt}</div>
      <div class="demo-row">
        <button class="demo-btn ok" onclick="pay.cardState='ok';renderPayment()">Giả lập thành công</button>
        <button class="demo-btn bad" onclick="pay.cardState='fail';renderPayment()">Giả lập thất bại</button>
      </div>
      ${s==='fail'?`<div class="demo-row"><button class="demo-btn" onclick="pay.cardState='idle';renderPayment()">Thử lại</button></div>`:''}
    </div>`;
}
function renderSplit(due){
  const remain=due-pay.splitCash-pay.splitBank;
  return `<div class="method-label">Thanh toán kết hợp</div>
    <div class="split-row"><label>Tiền mặt</label><input inputmode="numeric" value="${pay.splitCash?fmtNum(pay.splitCash):''}" placeholder="0" oninput="onSplit('cash',this.value)"></div>
    <div class="split-row"><label>Chuyển khoản</label><input inputmode="numeric" value="${pay.splitBank?fmtNum(pay.splitBank):''}" placeholder="0" oninput="onSplit('bank',this.value)"></div>
    <div class="split-remain ${remain===0?'zero':''}"><span>Còn lại</span><span>${fmt(Math.max(0,remain))}</span></div>
    <div style="margin-top:8px"><button class="quick-btn" style="width:100%" onclick="fillSplitRest()">Điền phần còn lại vào chuyển khoản</button></div>`;
}
function onSplit(which,v){const n=parseInt(String(v).replace(/[^\d]/g,''))||0;if(which==='cash')pay.splitCash=n;else pay.splitBank=n;renderPayment();}
function fillSplitRest(){pay.splitBank=Math.max(0,pay.due-pay.splitCash);renderPayment();}
function renderPayConfirm(due){
  let ready=false,label='Xác nhận đã nhận tiền';
  if(pay.method==='cash'){ready=pay.cashGiven>=due;label=ready?('Xác nhận đã nhận '+fmt(pay.cashGiven)):'Chưa đủ tiền';}
  else if(pay.method==='qr'){ready=pay.qrPaid;label=ready?'Hoàn tất đơn hàng':'Đang chờ thanh toán...';}
  else if(pay.method==='card'){ready=pay.cardState==='ok';label=ready?'Hoàn tất đơn hàng':(pay.cardState==='fail'?'Giao dịch thất bại':'Đang chờ quẹt thẻ...');}
  else if(pay.method==='split'){const paid=pay.splitCash+pay.splitBank;ready=paid>=due;label=ready?'Hoàn tất đơn hàng':'Còn thiếu '+fmt(due-paid);}
  return `<button class="pay-confirm" ${ready?'':'disabled'} onclick="completePayment()">${label}</button>`;
}
function methodLabel(){return {cash:'Tiền mặt',qr:'Chuyển khoản / QR',card:'Thẻ (PAYOO)',split:'Tiền mặt + Chuyển khoản'}[pay.method];}
function orderCode(){return 'POS-HN01-'+String(orderSeq).padStart(6,'0');}
function qrContent(){return 'POSHN01'+String(orderSeq).padStart(6,'0');}

/* ============================================================
   SUCCESS + RECEIPT
   ============================================================ */
function completePayment(){
  const c=getCart();const t=cartTotals(c);
  pay.mode='success';
  pay.order={
    code:orderCode(),datetime:new Date().toLocaleString('vi-VN'),
    store:store().name,storeAddress:store().address,
    seller:c.seller,cashier:CURRENT_USER.name,
    customer:c.customer?c.customer.name:'Khách lẻ',
    customerPhone:c.customer?c.customer.phoneDisplay:'',
    method:methodLabel(),
    items:c.items.map(it=>({...it,info:lineInfo(it),lp:linePromotion(it)})),
    sub:t.sub,promoTotal:t.promoTotal,voucherCode:t.voucherCode,voucherTotal:t.voucherTotal,total:t.total,
    cashGiven:pay.method==='cash'?pay.cashGiven:(pay.method==='split'?pay.splitCash+pay.splitBank:pay.due),
    change:pay.method==='cash'?pay.cashGiven-pay.due:0
  };
  orderSeq++;renderCartPanel();toast('Thanh toán thành công','ok');
}
function renderSuccess(){renderCartPanel();}
// Success INLINE — thay payment section, giữ header/khách phía trên, danh sách trái vẫn còn
function renderSuccessInline(){
  const o=pay.order;
  return `<div class="success">
    <div class="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></div>
    <h2>Thanh toán thành công</h2>
    <div class="success-sub">Đơn đã được ghi nhận.</div>
    <div class="success-card">
      <div class="sr"><span class="k">Mã đơn</span><span class="v">${o.code}</span></div>
      <div class="sr big"><span class="k">Tổng thanh toán</span><span class="v">${fmt(o.total)}</span></div>
      <div class="sr"><span class="k">Phương thức</span><span class="v">${o.method}</span></div>
      <div class="sr"><span class="k">Khách hàng</span><span class="v">${o.customer}</span></div>
      <div class="sr"><span class="k">Người bán</span><span class="v">${o.seller}</span></div>
      ${o.change>0?`<div class="sr"><span class="k">Tiền thừa</span><span class="v">${fmt(o.change)}</span></div>`:''}
    </div>
    <div class="success-actions">
      <button class="sa-primary" onclick="showReceipt()">In hóa đơn</button>
      <button class="sa-ghost" onclick="toast('Đã gửi hóa đơn điện tử tới khách','ok')">Gửi hóa đơn điện tử</button>
      <button class="sa-ghost" onclick="finishOrder()">Đơn mới</button>
    </div>
  </div>`;
}
function finishOrder(){
  carts=carts.filter(c=>c.id!==activeCartId);
  if(!carts.length){carts.push({id:nextCartId++,seller:CURRENT_USER.name,sellerId:CURRENT_USER.id,time:now(),items:[],customer:null,synced:true,lookup:null,voucher:null});}
  activeCartId=carts[0].id;pay=null;
  renderTabs();renderCartPanel();
}
function showReceipt(){
  const o=pay.order;
  const itemsHtml=o.items.map(it=>{
    const info=it.info,lp=it.lp;
    const lineBase=info.price*it.qty,lineFinal=lineBase-lp.discount;
    return `<div class="rc-item">
      <div class="rc-item-top"><span>${info.name}</span><span>${fmt(lineFinal)}</span></div>
      <div class="rc-item-sub"><span>${info.sku}${info.summary?' · '+info.summary:''}</span><span>${it.qty} × ${fmt(info.price)}${lp.discount?' (KM)':''}</span></div>
    </div>`;
  }).join('');
  el('receiptPrint').innerHTML=`
    <div class="rc-center"><div class="rc-logo">SEVA</div><div class="rc-brand">Seva Retail — Trang sức cao cấp</div></div>
    <hr class="rc-hr">
    <div class="rc-meta"><div>${o.store}</div><div>${o.storeAddress}</div><div>Hotline: 1900 6789</div></div>
    <hr class="rc-hr">
    <div class="rc-meta">
      <div class="rc-row"><span>Mã đơn</span><strong>${o.code}</strong></div>
      <div class="rc-row"><span>Ngày giờ</span><span>${o.datetime}</span></div>
      <div class="rc-row"><span>Người bán</span><span>${o.seller}</span></div>
      <div class="rc-row"><span>Thu ngân</span><span>${o.cashier}</span></div>
      <div class="rc-row"><span>Khách hàng</span><span>${o.customer}${o.customerPhone?' · '+o.customerPhone:''}</span></div>
    </div>
    <hr class="rc-hr">
    <div class="rc-items">${itemsHtml}</div>
    <hr class="rc-hr">
    <div class="rc-tot">
      <div class="rc-row"><span>Tiền hàng</span><span>${fmt(o.sub)}</span></div>
      ${o.promoTotal?`<div class="rc-row"><span>Khuyến mại</span><span>-${fmt(o.promoTotal)}</span></div>`:''}
      ${o.voucherTotal?`<div class="rc-row"><span>Voucher ${o.voucherCode}</span><span>-${fmt(o.voucherTotal)}</span></div>`:''}
      <div class="rc-row grand"><span>Tổng thanh toán</span><span>${fmt(o.total)}</span></div>
      <div class="rc-row"><span>Phương thức</span><span>${o.method}</span></div>
      ${o.method==='Tiền mặt'?`<div class="rc-row"><span>Tiền khách đưa</span><span>${fmt(o.cashGiven)}</span></div>
      <div class="rc-row"><span>Tiền thừa</span><span>${fmt(o.change)}</span></div>`:''}
    </div>
    <div class="rc-qr"></div>
    <div class="rc-foot">
      <div>Mã tra cứu: RCP-9K7M2</div>
      <div>Đổi size/mẫu trong 7 ngày theo điều kiện sản phẩm và chính sách thương hiệu.</div>
      <div><strong>Cảm ơn quý khách — hẹn gặp lại!</strong></div>
    </div>
    <div class="receipt-actions">
      <button class="mbtn mbtn-primary" onclick="window.print()">In thử</button>
      <button class="mbtn mbtn-ghost" onclick="closeModal('receiptScrim')">Đóng</button>
    </div>`;
  openModal('receiptScrim');
}

/* ============================================================
   OFFLINE / CONNECTION
   ============================================================ */
function applyConnState(){
  el('offlineBanner').classList.toggle('show',offline);
  el('offSwitch').classList.toggle('on',offline);
  const pill=el('connPill');
  if(offline){pill.className='pill pill-offline';pill.innerHTML='<span class="status-dot"></span>Offline';}
  else{pill.className='pill pill-online';pill.innerHTML='<span class="status-dot"></span>Online';}
}
function toggleOffline(){
  offline=!offline;
  el('offSwitch').classList.toggle('on',offline);
  el('offlineBanner').classList.toggle('show',offline);
  const pill=el('connPill');
  if(offline){pill.className='pill pill-offline';pill.innerHTML='<span class="status-dot"></span>Offline';}
  else{
    pill.className='pill pill-sync';pill.innerHTML='<span class="status-dot"></span>Đang đồng bộ...';
    setTimeout(()=>{pill.className='pill pill-online';pill.innerHTML='<span class="status-dot"></span>Online';
      carts.forEach(c=>c.synced=true);renderTabs();renderCartPanel();toast('Đã đồng bộ xong','ok');},1500);
  }
  renderTabs();renderCartPanel();
}

/* ============================================================
   SEARCH DROPDOWN + BARCODE (scan-first) + KEYBOARD
   ============================================================ */
// Gõ -> hiện dropdown kết quả (KHÔNG mở Product Grid); render grid chỉ trong catalog drawer
el('searchInput').addEventListener('input',e=>{
  searchTerm=e.target.value;
  el('searchClear').classList.toggle('show',!!searchTerm);
  renderSearchDropdown();
  if(el('catalogDrawer').classList.contains('show'))renderProducts();
});
el('searchInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'){const q=e.target.value.trim();if(!q)return;
    hideSearchDropdown();
    if(handleBarcodeScan(q)){e.target.value='';searchTerm='';el('searchClear').classList.remove('show');}
  }
  if(e.key==='Escape'){hideSearchDropdown();}
});

// Kết quả tìm theo tên/SKU/variant/serial (tối đa 8)
function searchResults(q){
  const s=q.toLowerCase();const out=[];
  for(const p of PRODUCTS){
    if(p.mode==='serialized'){
      p.items.forEach(it=>{
        if(p.name.toLowerCase().includes(s)||it.sku.toLowerCase().includes(s)||it.serial.toLowerCase().includes(s))
          out.push({kind:'serial',p,it});
      });
    } else {
      // khớp tên sản phẩm -> gợi ý mở selector; khớp SKU variant -> thêm thẳng
      const vhit=p.variants.find(v=>v.sku.toLowerCase().includes(s));
      if(vhit)out.push({kind:'variant',p,v:vhit});
      else if(p.name.toLowerCase().includes(s))out.push({kind:'product',p});
    }
  }
  return out.slice(0,8);
}
function renderSearchDropdown(){
  const q=searchTerm.trim();const dd=el('searchDropdown');
  if(!q){hideSearchDropdown();return;}
  const res=searchResults(q);
  let html=res.map((r,i)=>{
    if(r.kind==='serial'){
      const it=r.it;const avail=it.status==='AVAILABLE';
      return `<div class="sd-item ${avail?'':'disabled'}" ${avail?`onclick="pickSearch(${i})"`:''}>
        <div class="sd-img">${CAT_EMOJI[r.p.cat]}</div>
        <div class="sd-mid"><div class="sd-name">${r.p.name}</div>
          <div class="sd-meta">Serial ${it.serial} · Size ${it.size} · ${it.weight} · ${it.sku}</div></div>
        <div class="sd-right"><div class="sd-price">${fmt(it.price)}</div><div class="sd-stock ${avail?'':'out'}">${STATUS_LABEL[it.status]}</div></div>
      </div>`;
    }
    if(r.kind==='variant'){
      const v=r.v;const oos=v.status!=='AVAILABLE'||v.stock<=0;
      const attrs=(r.p.attributes||[]).map(a=>a==='size'?'Size '+v.size:v[a]).filter(Boolean).join(' · ')||[v.material,v.size].filter(Boolean).join(' · ');
      return `<div class="sd-item ${oos?'disabled':''}" ${oos?'':`onclick="pickSearch(${i})"`}>
        <div class="sd-img">${CAT_EMOJI[r.p.cat]}</div>
        <div class="sd-mid"><div class="sd-name">${r.p.name}</div>
          <div class="sd-meta">${v.sku}${attrs?' · '+attrs:''}</div></div>
        <div class="sd-right"><div class="sd-price">${fmt(v.price)}</div><div class="sd-stock ${oos?'out':''}">${oos?'Hết hàng':'Còn '+v.stock}</div></div>
      </div>`;
    }
    // product cha -> mở selector
    const stock=productStock(r.p);
    return `<div class="sd-item ${stock<=0?'disabled':''}" ${stock<=0?'':`onclick="pickSearch(${i})"`}>
      <div class="sd-img">${CAT_EMOJI[r.p.cat]}</div>
      <div class="sd-mid"><div class="sd-name">${r.p.name}</div>
        <div class="sd-meta">${productVariantCount(r.p)} biến thể · từ ${fmt(productMinPrice(r.p))}</div></div>
      <div class="sd-right"><div class="sd-stock ${stock<=0?'out':''}">${stock<=0?'Hết hàng':'Còn '+stock}</div></div>
    </div>`;
  }).join('');
  if(!res.length)html=`<div class="sd-empty">Không có kết quả cho "${q}"</div>`;
  html+=`<div class="sd-more" onclick="openCatalog()">Duyệt toàn bộ danh mục →</div>`;
  dd.innerHTML=html;dd.classList.add('show');
  dd._results=res;
}
function hideSearchDropdown(){const dd=el('searchDropdown');dd.classList.remove('show');}
function pickSearch(i){
  const dd=el('searchDropdown');const r=(dd._results||[])[i];if(!r)return;
  const src=activeCartId;
  hideSearchDropdown();el('searchInput').value='';searchTerm='';el('searchClear').classList.remove('show');
  if(r.kind==='serial'){addSerialToCart(r.p,r.it,src);}
  else if(r.kind==='variant'){addVariantToCart(r.p,r.v,src);}
  else {handleAddProduct(r.p.id);} // product cha -> mở selector
}

/* ---------- BARCODE SCAN-FIRST (6 case) ---------- */
function handleBarcodeScan(code){
  const raw=code.trim();const Q=raw.toUpperCase();
  const cart=getCart();
  for(const p of PRODUCTS){
    if(p.mode==='serialized'){
      const it=p.items.find(i=>(i.barcode&&i.barcode.toUpperCase()===Q)||i.serial.toUpperCase()===Q);
      if(it){
        // serial đã có trong giỏ -> báo trùng, không tăng
        if(cart.items.some(x=>x.serial===it.serial)){toast(`Serial ${it.serial} đã có trong Giỏ #${cart.id}.`,'err');return true;}
        if(it.status==='RESERVED'){toast(`Sản phẩm ${it.serial} đang được giữ.`,'err');return true;}
        if(it.status==='SOLD'){toast('Sản phẩm này đã được bán.','err');return true;}
        if(it.status!=='AVAILABLE'){toast(`Sản phẩm ${it.serial}: ${STATUS_LABEL[it.status]}.`,'err');return true;}
        addSerialToCart(p,it,activeCartId);return true;
      }
    } else {
      // barcode/SKU trùng đúng variant -> thêm thẳng
      const v=p.variants.find(x=>(x.barcode&&x.barcode.toUpperCase()===Q)||x.sku.toUpperCase()===Q);
      if(v){
        if(v.status!=='AVAILABLE'||v.stock<=0){toast('Sản phẩm đã hết hàng tại điểm bán.','err');return true;}
        addVariantToCart(p,v,activeCartId);return true;
      }
    }
  }
  // barcode chỉ xác định product cha (khớp id) -> mở selector
  const parent=PRODUCTS.find(p=>p.id.toUpperCase()===Q);
  if(parent){handleAddProduct(parent.id);return true;}
  toast('Không tìm thấy sản phẩm với mã này.','err');return false;
}
// giữ tên cũ để tương thích
const simulateBarcodeScan=handleBarcodeScan;

el('searchClear').onclick=()=>{el('searchInput').value='';searchTerm='';el('searchClear').classList.remove('show');hideSearchDropdown();el('searchInput').focus();};
el('filterInStock').onclick=()=>{
  inStockOnly=!inStockOnly;el('filterInStock').classList.toggle('on',inStockOnly);
  el('filterChips').innerHTML=inStockOnly?'<span class="chip">Còn hàng</span>':'';renderProducts();
};

/* ---------- CATALOG DRAWER (Duyệt danh mục) ---------- */
function openCatalog(){
  hideSearchDropdown();
  el('catalogTarget').textContent='Thêm vào Giỏ #'+activeCartId;
  el('catalogScrim').classList.add('show');
  el('catalogDrawer').classList.add('show');
  renderProducts();
}
function closeCatalog(){
  el('catalogScrim').classList.remove('show');
  el('catalogDrawer').classList.remove('show');
  const si=el('searchInput');if(si)si.focus();
}
el('custConfirm').onclick=createCustomer;
// đóng popover khi click ngoài
document.addEventListener('click',e=>{
  const sp=el('sellerPop');if(sp&&sp.classList.contains('show')&&!e.target.closest('.cart-seller'))sp.classList.remove('show');
  const stp=el('storePop');if(stp&&stp.classList.contains('show')&&!e.target.closest('.hdr-store'))stp.classList.remove('show');
  const dd=el('searchDropdown');if(dd&&dd.classList.contains('show')&&!e.target.closest('.search-wrap'))hideSearchDropdown();
  const cm=el('cartMenu');if(cm&&cm.classList.contains('show')&&!e.target.closest('.cart-menu-wrap'))cm.classList.remove('show');
  const cim=el('custMenu');if(cim&&cim.classList.contains('show')&&!e.target.closest('.cust-menu-wrap'))cim.classList.remove('show');
});
document.addEventListener('keydown',e=>{
  if(e.key==='F3'){e.preventDefault();el('searchInput').focus();el('searchInput').select();}
  if(e.key==='F4'){e.preventDefault();const l=el('custLookup');if(l)l.focus();}
  if(e.key==='Escape'){['custScrim','receiptScrim','voucherScrim'].forEach(closeModal);const p=el('sellerPop');if(p)p.classList.remove('show');const sp=el('storePop');if(sp)sp.classList.remove('show');if(selCtx)closeSelector();if(el('catalogDrawer').classList.contains('show'))closeCatalog();}
  if(e.ctrlKey&&e.key>='1'&&e.key<='5'){e.preventDefault();const c=carts[parseInt(e.key)-1];if(c)switchCart(c.id);}
});

/* ============================================================
   CUSTOMER DISPLAY
   ============================================================ */
let cdWin=null;
function customerDisplayHTML(){
  const s=store();
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>SEVA — Màn hình khách hàng</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
    body{height:100vh;background:#07554B;color:#fff;display:flex;flex-direction:column;overflow:hidden}
    .cd-top{padding:20px 32px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.15)}
    .cd-logo{font-size:26px;font-weight:800;letter-spacing:1px}
    .cd-store{font-size:14px;opacity:.8}
    .cd-body{flex:1;display:flex;flex-direction:column;padding:24px 32px;overflow:hidden}
    .cd-items{flex:1;overflow-y:auto}
    .cd-item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:18px}
    .cd-item .q{opacity:.7;font-size:15px}.cd-item .p{font-weight:700}
    .cd-empty{flex:1;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.6}
    .cd-sum{border-top:2px solid rgba(255,255,255,.3);padding-top:16px;margin-top:8px}
    .cd-row{display:flex;justify-content:space-between;font-size:17px;padding:4px 0;opacity:.85}
    .cd-row.disc{color:#8fe3b0}
    .cd-total{display:flex;justify-content:space-between;align-items:baseline;margin-top:10px}
    .cd-total .l{font-size:20px}.cd-total .v{font-size:44px;font-weight:800}
    .cd-qr-view,.cd-ok-view{flex:1;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    .cd-qr-view h1{font-size:30px;font-weight:700;margin-bottom:24px}
    .cd-qr-big{width:300px;height:300px;background:repeating-conic-gradient(#07554B 0% 25%,#fff 0% 50%) 0 0/34px 34px;border:16px solid #fff;border-radius:16px;position:relative}
    .cd-qr-big::after{content:'SEVA';position:absolute;inset:0;margin:auto;width:70px;height:70px;background:#fff;color:#07554B;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;border-radius:8px}
    .cd-qr-amt{font-size:48px;font-weight:800;margin:24px 0 8px}
    .cd-qr-info{font-size:18px;opacity:.9;line-height:1.7}
    .cd-ok-circle{width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:64px;margin-bottom:24px}
    .cd-ok-view h1{font-size:40px;font-weight:800;margin-bottom:10px}.cd-ok-view p{font-size:22px;opacity:.85}
    body.qr .cd-cart-view{display:none}body.qr .cd-qr-view{display:flex}
    body.ok .cd-cart-view{display:none}body.ok .cd-ok-view{display:flex}
  </style></head>
  <body>
    <div class="cd-top"><span class="cd-logo">SEVA</span><span class="cd-store">${s.name}</span></div>
    <div class="cd-body">
      <div class="cd-cart-view" style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div class="cd-items" id="cdItems"></div>
        <div class="cd-sum">
          <div class="cd-row"><span>Tiền hàng</span><span id="cdSub">0đ</span></div>
          <div class="cd-row disc" id="cdDiscRow"><span>Giảm giá</span><span id="cdDisc">0đ</span></div>
          <div class="cd-total"><span class="l">Khách cần trả</span><span class="v" id="cdTotal">0đ</span></div>
        </div>
      </div>
      <div class="cd-qr-view"><h1>Vui lòng quét mã để thanh toán</h1><div class="cd-qr-big"></div><div class="cd-qr-amt" id="cdQrAmt">0đ</div><div class="cd-qr-info" id="cdQrInfo"></div></div>
      <div class="cd-ok-view"><div class="cd-ok-circle">✓</div><h1>Thanh toán thành công</h1><p>Cảm ơn quý khách — hẹn gặp lại!</p></div>
    </div>
    <script>
      window.addEventListener('message',function(e){
        var d=e.data;if(!d||d.type!=='seva-cd')return;
        document.body.className=d.view||'';
        if(d.view==='qr'){
          document.getElementById('cdQrAmt').textContent=d.total;
          document.getElementById('cdQrInfo').innerHTML='VIB · STK <strong>123123213</strong><br>ND: <strong>'+d.qrContent+'</strong>';
        } else if(d.view!=='ok'){
          var box=document.getElementById('cdItems');
          box.innerHTML=d.items&&d.items.length?d.items.map(function(it){
            return '<div class="cd-item"><div><div>'+it.name+'</div><div class="q">'+it.qty+' × '+it.unit+'</div></div><div class="p">'+it.line+'</div></div>';
          }).join(''):'<div class="cd-empty">Chào mừng quý khách đến với SEVA</div>';
          document.getElementById('cdSub').textContent=d.sub;
          document.getElementById('cdDisc').textContent=d.disc;
          document.getElementById('cdDiscRow').style.display=d.hasDisc?'flex':'none';
          document.getElementById('cdTotal').textContent=d.total;
        }
      });
      if(window.opener)window.opener.postMessage({type:'seva-cd-ready'},'*');
    <\/script>
  </body></html>`;
}
function openCustomerDisplay(){
  if(!store().customerDisplay){toast('Điểm bán này chưa bật màn hình khách hàng','err');return;}
  if(cdWin&&!cdWin.closed){cdWin.focus();cdSync();return;}
  cdWin=window.open('','sevaCustomerDisplay','width=900,height=650');
  if(!cdWin){toast('Trình duyệt chặn cửa sổ — cho phép popup để dùng màn hình khách','err');return;}
  cdWin.document.open();cdWin.document.write(customerDisplayHTML());cdWin.document.close();
  toast('Đã mở màn hình khách hàng','ok');setTimeout(cdSync,200);
}
function cdSync(){
  if(!cdWin||cdWin.closed)return;
  const c=getCart();const t=cartTotals(c);
  let view='cart';
  if(pay&&pay.mode==='success')view='ok';else if(pay&&pay.method==='qr')view='qr';
  const disc=t.promoTotal+t.voucherTotal;
  cdWin.postMessage({type:'seva-cd',view,
    sub:fmt(t.sub),disc:'-'+fmt(disc),hasDisc:disc>0,total:fmt(pay?pay.due:t.total),qrContent:qrContent(),
    items:c.items.map(it=>{const info=lineInfo(it);const lp=linePromotion(it);const line=info.price*it.qty-lp.discount;
      return {name:info.name,qty:it.qty,unit:fmt(info.price),line:fmt(line)};})
  },'*');
}
function showQROnCustomer(){openCustomerDisplay();setTimeout(cdSync,250);toast('Đã hiển thị QR trên màn hình khách','ok');}

/* ============================================================
   INIT
   ============================================================ */
renderStoreHeader();
renderCats();
renderProducts();
renderTabs();
renderCartPanel();
