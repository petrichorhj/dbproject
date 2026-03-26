<template>
    <div class="mstand-order" style="min-height: calc(100vh - 120px); background: #fff;">
  
      <!-- 顶部（新增钱包+订单记录入口） -->
      <div class="top-bar">
        <div class="location" @click="storeDialog = true">
          <i class="el-icon-location"></i>
          {{ currentStore.name }}
        </div>
        <div class="logo">M Stand</div>
        <div class="cart-wallet-record">
          <div class="cart-icon" @click="cartDrawer = true">
            <i class="el-icon-shopping-cart-full"></i>
            <span v-if="cartList.length > 0" class="badge">{{ cartList.length }}</span>
          </div>
          <el-button type="text" @click="goToWallet" class="wallet-btn">
            <i class="el-icon-wallet"></i> 钱包
          </el-button>
          <el-button type="text" @click="goToOrderRecord" class="record-btn">
            <i class="el-icon-document"></i> 订单
          </el-button>
        </div>
      </div>
  
      <!-- 主体 -->
      <div class="body-content">
        <!-- 左侧分类 -->
        <div class="category-side">
          <div
            v-for="(c, i) in categoryList"
            :key="i"
            class="category-item"
            :class="{ active: activeCat === i }"
            @click="activeCat = i"
          >
            {{ c.name }}
          </div>
        </div>
  
        <!-- 商品列表 -->
        <div class="goods-wrap">
          <div v-for="item in productList[activeCat]" :key="item.id" class="good-card">
            <img :src="item.image" class="good-img" alt>
            <div class="good-info">
              <div class="good-name">{{ item.name }}</div>
              <div class="good-desc">{{ item.desc }}</div>
              <div class="good-price">¥{{ item.price }}</div>
              <button class="buy-btn" @click="openSpec(item)">选规格</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 门店弹窗 -->
      <el-dialog :visible.sync="storeDialog" width="420px" title="选择门店" center>
        <div v-for="s in storeList" :key="s.id" class="store-item" @click="selectStore(s)">
          <div class="s-name">{{ s.name }}</div>
          <div class="s-address">{{ s.address }}</div>
        </div>
      </el-dialog>
  
      <!-- 规格弹窗 -->
      <el-dialog :visible.sync="specDialog" width="400px" title="选择规格" center>
        <div v-if="currentItem">
          <img :src="currentItem.image" class="spec-image">
          <div class="spec-good-name">{{ currentItem.name }}</div>
          <div class="spec-price">¥{{ currentItem.price }}</div>
  
          <div class="spec-group" v-for="(sp, i) in currentItem.specs" :key="i">
            <div class="spec-label">{{ sp.name }}</div>
            <el-radio-group v-model="sp.selectedValue">
              <el-radio v-for="v in sp.values" :key="v.value" :label="v.value" border>
                {{ v.label }}
                <span v-if="v.price > 0" class="red">+¥{{ v.price }}</span>
              </el-radio>
            </el-radio-group>
          </div>
  
          <div style="margin-top:20px;">
            <span>数量</span>
            <el-input-number v-model="buyNum" :min="1" :max="20" size="mini"></el-input-number>
          </div>
        </div>
  
        <div slot="footer">
          <el-button @click="specDialog = false">取消</el-button>
          <el-button type="primary" @click="addToCart">加入购物车</el-button>
        </div>
      </el-dialog>
  
      <!-- 购物车抽屉 -->
      <el-drawer :visible.sync="cartDrawer" direction="rtl" size="380px" title="购物车">
        <div v-if="cartList.length === 0" style="padding:60px 0;text-align:center;color:#ccc">
          购物车空空如也
        </div>
        <div v-else>
          <div class="cart-list">
            <div v-for="(item, i) in cartList" :key="i" class="cart-item">
              <div class="cart-left">
                <div class="cart-name">{{ item.name }}</div>
                <div class="cart-spec">{{ item.specDesc }}</div>
              </div>
              <div class="cart-right">
                <div class="cart-price">¥{{ item.unitPrice }} × {{ item.count }}</div>
                <div class="cart-del" @click="removeCart(i)">删除</div>
              </div>
            </div>
          </div>
  
          <div class="cart-total-bar">
            <span>合计</span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
  
          <el-button type="primary" class="checkout-btn" @click="toCheckout">结算支付</el-button>
        </div>
      </el-drawer>
    </div>
  </template>
  
  <script>
  export default {
    name: "MStandOrder",
    data() {
      return {
        storeDialog: false,
        specDialog: false,
        cartDrawer: false,
        activeCat: 0,
        buyNum: 1,
        currentItem: null,
        walletBalance: 0, // 同步钱包余额
  
        storeList: [
          { id: 1, name: "M Stand · 新天地店", address: "黄浦区马当路245号" },
          { id: 2, name: "M Stand · 静安寺店", address: "静安区南京西路1266号" },
        ],
        currentStore: { id: 1, name: "M Stand · 新天地店" },
  
        categoryList: [
          { name: "咖啡系列" },
          { name: "无咖啡因" },
          { name: "小食系列" },
          { name: "周边产品" },
        ],
  
        productList: [
          [
            {
              id: 101,
              name: "冰橙美式",
              desc: "清爽冷萃 · 鲜橙风味",
              price: 38,
              image: require("@/assets/mstand/coffee1.jpg"),
              specs: [
                { name: "杯型", selectedValue: "mid", values: [
                  { label: "中杯", value: "mid", price: 0 },
                  { label: "大杯", value: "big", price: 5 },
                ]},
                { name: "温度", selectedValue: "ice", values: [
                  { label: "冰", value: "ice", price: 0 },
                  { label: "热", value: "hot", price: 0 },
                ]}
              ]
            },
            {
              id: 102,
              name: "白桃乌龙拿铁",
              desc: "白桃果香 · 丝滑口感",
              price: 42,
              image: require("@/assets/mstand/coffee2.jpg"),
              specs: [
                { name: "杯型", selectedValue: "mid", values: [
                  { label: "中杯", value: "mid", price: 0 },
                  { label: "大杯", value: "big", price: 5 },
                ]}
              ]
            }
          ],
          [
            {
              id: 201,
              name: "荔枝冻冻",
              desc: "清甜荔枝 · 椰乳风味",
              price: 36,
              image: require("@/assets/mstand/drink1.jpg"),
              specs: []
            }
          ],
          [
            {
              id: 301,
              name: "海盐牛角包",
              desc: "酥脆咸香",
              price: 28,
              image: require("@/assets/mstand/food1.jpg"),
              specs: []
            }
          ],
          [
            {
              id: 401,
              name: "M Stand 随行杯",
              desc: "简约设计 · 不锈钢",
              price: 128,
              image: require("@/assets/mstand/cup1.jpg"),
              specs: []
            }
          ]
        ],
  
        cartList: []
      };
    },
    created() {
      // 初始化读取钱包余额
      this.walletBalance = Number(localStorage.getItem('mstand_wallet_balance')) || 100;
    },
    computed: {
      totalPrice() {
        return this.cartList.reduce((sum, item) => sum + item.unitPrice * item.count, 0);
      }
    },
    methods: {
      // 跳转到钱包页面（防重复）
      goToWallet() {
        if (this.$route.path === '/wallet') {
          this.$message.info("当前已在钱包页面");
          return;
        }
        this.$router.push('/wallet');
      },
  
      // 新增：跳转到订单记录页面（防重复）
      goToOrderRecord() {
        if (this.$route.path === '/order-record') {
          this.$message.info("当前已在订单记录页面");
          return;
        }
        this.$router.push('/order-record');
      },
  
      // 选择门店
      selectStore(s) {
        this.currentStore = s;
        this.storeDialog = false;
        this.$message.success("已切换门店：" + s.name);
      },
  
      // 打开规格
      openSpec(item) {
        this.currentItem = JSON.parse(JSON.stringify(item));
        this.buyNum = 1;
        this.specDialog = true;
      },
  
      // 加入购物车
      addToCart() {
        if (!this.currentItem) return;
        let specDesc = "";
        let add = 0;
        this.currentItem.specs.forEach(sp => {
          const v = sp.values.find(x => x.value === sp.selectedValue);
          if (v) {
            specDesc += v.label + " ";
            add += v.price;
          }
        });
        specDesc = specDesc.trim() || "默认规格";
        const up = this.currentItem.price + add;
  
        const has = this.cartList.find(x => x.id === this.currentItem.id && x.specDesc === specDesc);
        if (has) {
          has.count += this.buyNum;
        } else {
          this.cartList.push({
            id: this.currentItem.id,
            name: this.currentItem.name,
            specDesc,
            unitPrice: up,
            count: this.buyNum
          });
        }
        this.specDialog = false;
        this.$message.success("已加入购物车");
      },
  
      // 删除购物车商品
      removeCart(i) {
        this.cartList.splice(i, 1);
      },
  
      // 结算支付（关联钱包扣款）
      toCheckout() {
        if (this.cartList.length === 0) {
          this.$message.warning("请先选择商品");
          return;
        }
  
        // 1. 获取当前钱包余额
        const currentBalance = Number(localStorage.getItem('mstand_wallet_balance')) || 100;
        // 2. 检查余额是否足够
        if (currentBalance < this.totalPrice) {
          this.$confirm(
            `余额不足（当前¥${currentBalance}），是否前往钱包充值？`,
            "提示",
            {
              confirmButtonText: "去充值",
              cancelButtonText: "取消"
            }
          ).then(() => {
            this.$router.push('/wallet'); // 跳转到钱包充值
          }).catch(() => {
            this.$message.info("已取消结算");
          });
          return;
        }
  
        // 3. 余额足够，确认扣款
        this.$confirm(
          `确认支付¥${this.totalPrice}？将从钱包余额中扣除`,
          "结算支付",
          {
            confirmButtonText: "确认支付",
            cancelButtonText: "取消",
            type: "info"
          }
        ).then(() => {
          // 4. 执行扣款逻辑
          this.deductWalletMoney();
        }).catch(() => {
          this.$message.info("已取消支付");
        });
      },
  
      // 钱包扣款 + 生成订单记录
      deductWalletMoney() {
        // 1. 计算扣款后余额
        const currentBalance = Number(localStorage.getItem('mstand_wallet_balance')) || 100;
        const newBalance = currentBalance - this.totalPrice;
        
        // 2. 更新本地存储的余额
        localStorage.setItem('mstand_wallet_balance', newBalance);
        
        // 3. 生成消费记录
        const tradeRecords = JSON.parse(localStorage.getItem('mstand_trade_records')) || [];
        tradeRecords.unshift({
          title: `M Stand消费（${this.currentStore.name}）`,
          amount: this.totalPrice,
          type: "expense", // 支出
          time: this.formatTime(new Date())
        });
        localStorage.setItem('mstand_trade_records', JSON.stringify(tradeRecords));
  
        // 新增：生成订单记录
        const orderRecords = JSON.parse(localStorage.getItem('mstand_order_records')) || [];
        const newOrder = {
          orderId: 'M' + Date.now(), // 唯一订单号
          storeName: this.currentStore.name, // 消费门店
          createTime: this.formatTime(new Date()), // 下单时间
          totalPrice: this.totalPrice, // 订单总价
          goodsList: JSON.parse(JSON.stringify(this.cartList)) // 商品列表
        };
        orderRecords.unshift(newOrder);
        localStorage.setItem('mstand_order_records', JSON.stringify(orderRecords));
        
        // 5. 提示+清空购物车
        this.$message.success(`支付成功！已扣除¥${this.totalPrice}，剩余余额¥${newBalance}`);
        this.cartList = [];
        this.cartDrawer = false;
        
        // 6. 同步余额显示
        this.walletBalance = newBalance;
      },
  
      // 格式化时间
      formatTime(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
    }
  };
  </script>
  
  <style scoped>
  /* 顶部 */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
    padding: 0 24px;
    border-bottom: 1px solid #f1f1f1;
    background: #fff;
  }
  .location {
    font-size: 14px;
    cursor: pointer;
  }
  .logo {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .cart-wallet-record {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .cart-icon {
    font-size: 20px;
    cursor: pointer;
    position: relative;
  }
  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #000;
    color: #fff;
    width: 18px;
    height: 18px;
    font-size: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wallet-btn, .record-btn {
    font-size: 14px;
    color: #333;
  }
  
  /* 主体 */
  .body-content {
    display: flex;
    padding: 20px;
  }
  .category-side {
    width: 160px;
    border-right: 1px solid #eee;
  }
  .category-item {
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  .category-item.active {
    background: #000;
    color: #fff;
  }
  
  /* 商品卡片 */
  .goods-wrap {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding-left: 20px;
  }
  .good-card {
    width: 230px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #eee;
  }
  .good-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  .good-info {
    padding: 14px;
  }
  .good-name {
    font-size: 16px;
    font-weight: 500;
  }
  .good-desc {
    font-size: 12px;
    color: #999;
    margin: 4px 0 8px;
  }
  .good-price {
    font-weight: bold;
    margin-bottom: 12px;
  }
  .buy-btn {
    width: 100%;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    height: 36px;
    cursor: pointer;
  }
  
  /* 规格 */
  .spec-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 12px;
  }
  .red { color: red; }
  
  /* 购物车样式 */
  .cart-list {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 4px;
  }
  .cart-item {
    display: flex;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid #f5f5f5;
  }
  .cart-left {
    flex: 1;
  }
  .cart-name {
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 4px;
  }
  .cart-spec {
    font-size: 12px;
    color: #999;
  }
  .cart-right {
    text-align: right;
  }
  .cart-price {
    font-weight: 500;
    margin-bottom: 4px;
  }
  .cart-del {
    font-size: 12px;
    color: #999;
    cursor: pointer;
  }
  
  .cart-total-bar {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 600;
    padding-top: 16px;
    margin-top: 12px;
    border-top: 1px solid #eee;
  }
  .checkout-btn {
    margin-top: 16px;
    width: 100%;
    height: 46px;
    font-size: 15px;
    background: #000 !important;
    border-color: #000 !important;
  }
  
  .store-item {
    padding: 10px 0;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  </style>