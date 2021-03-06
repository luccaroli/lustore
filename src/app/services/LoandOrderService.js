const Order = require('../models/Order')
const User = require('../models/User')
const LoadProductService = require('./LoadProductService')
const { formatPrice, date } = require("../../lib/utils") 


async function format(order) {
  // details of product 
  order.product = await LoadProductService.load('productWithDeleted', {
    where: { id: order.product_id }
  })

  // details of buyer 
  order.buyer = await User.findOne({
    where: { id: order.buyer_id }
  })

  // details of sallesman
  order.seller = await User.findOne({
    where: { id: order.seller_id }
  })

  // format price 
  order.formattedPrice = formatPrice(order.price)
  order.formattedTotal = formatPrice(order.total)

  // format status 
  const statuses = {
    open: 'Aberto',
    sold: 'Vendido',
    canceled: 'Cancelado'
  }

  order.formattedStatus = statuses[order.status]

  // format from update at 
  const updateAt = date(order.updated_at)
  order.formattedUpdatedAt = `
    ${order.formattedStatus} em ${updateAt.day}/${updateAt.month}/${updateAt.year} às ${updateAt.hour}h${updateAt.minutes}
  `
  return order

}

const LoadService = {
  load(service, filter) {
    this.filter = filter
    return this[service]()
  },
  async order() {
    try {
      const order = await Order.findOne(this.filter)
      return format(order)
      
    } catch (error) {
      console.error(error)
    }
  },
  async orders() {
    try {
      const orders = await Order.findAll(this.filter)
      const ordersPromise = orders.map(format)
      
      return Promise.all(ordersPromise)
      
    } catch (error) {
      console.error(error)
    }
  },
  format,
  
}

module.exports = LoadService