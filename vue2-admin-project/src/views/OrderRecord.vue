<template>
    <div class="order-record-page" style="min-height: calc(100vh - 120px); background: #fff; padding: 20px;">
      <!-- 顶部标题 + 返回按钮 -->
      <div class="record-header">
        <h2 class="record-title">我的订单</h2>
        <el-button type="text" @click="goToOrder" class="back-btn">
          <i class="el-icon-arrow-left"></i> 返回点单
        </el-button>
      </div>
  
      <!-- 订单列表 -->
      <div class="order-list">
        <div v-if="orderList.length === 0" class="empty-order">
          暂无点单记录
        </div>
        <div v-else class="order-card" v-for="(order, i) in orderList" :key="i">
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-store">{{ order.storeName }}</div>
            <div class="order-time">{{ order.createTime }}</div>
          </div>
          
          <!-- 订单商品 -->
          <div class="order-goods">
            <div class="goods-item" v-for="(goods, j) in order.goodsList" :key="j">
              <div class="goods-info">
                <div class="goods-name">{{ goods.name }}</div>
                <div class="goods-spec">{{ goods.specDesc }}</div>
              </div>
              <div class="goods-price">¥{{ goods.unitPrice }} × {{ goods.count }}</div>
            </div>
          </div>
          
          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-status">已支付</div>
            <div class="order-total">总计：¥{{ order.totalPrice }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "OrderRecord",
    data() {
      return {
        orderList: [] // 订单列表（这里不再需要 currentStore）
      };
    },
    created() {
      // 加载本地存储的订单记录
      const savedOrders = localStorage.getItem('mstand_order_records');
      if (savedOrders) {
        this.orderList = JSON.parse(savedOrders);
      }
    },
    methods: {
      // 返回点单页面（防重复跳转）
      goToOrder() {
        if (this.$route.path === '/mstand') {
          this.$message.info("当前已在点单页面");
          return;
        }
        this.$router.push('/mstand');
      }
    }
  };
  </script>
  
  <style scoped>
  /* 顶部 */
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .record-title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  .back-btn {
    color: #000;
    font-size: 14px;
  }
  
  /* 订单列表 */
  .empty-order {
    text-align: center;
    padding: 60px 0;
    color: #ccc;
  }
  .order-card {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 15px;
  }
  
  /* 订单头部 */
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f5f5f5;
  }
  .order-store {
    font-weight: 500;
  }
  .order-time {
    font-size: 12px;
    color: #999;
  }
  
  /* 订单商品 */
  .order-goods {
    margin: 12px 0;
  }
  .goods-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
  }
  .goods-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  .goods-spec {
    font-size: 12px;
    color: #999;
  }
  .goods-price {
    font-weight: 500;
  }
  
  /* 订单底部 */
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #f5f5f5;
  }
  .order-status {
    font-size: 12px;
    color: #67c23a;
  }
  .order-total {
    font-weight: 600;
    font-size: 16px;
  }
  </style>