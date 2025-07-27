import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register font (optional)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9fBBc9.ttf",
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    padding: 30,
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  col: {
    width: "50%",
  },
  productRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    marginBottom: 5,
  },
  productDetails: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
    textAlign: "center",
    fontSize: 8,
  },
});

const InvoicePDF = ({ order }) => {
  if (!order) {
    return (
      <Document>
        <Page size="A4">
          <Text>No order data available</Text>
        </Page>
      </Document>
    );
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const totalMRP = order.products.reduce(
    (sum, p) => sum + (p.priceAtPurchase || 0) * p.quantity,
    0
  );

  const totalDiscount = order.products.reduce(
    (sum, p) =>
      sum +
      ((p.priceAtPurchase * (p.discountAtPurchase || 0)) / 100) * p.quantity,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Lucky Footwear</Text>
            <Text>123 Shoe Street, Jajmau Industrial Area,</Text>
            <Text>Kanpur, Uttar Pradesh 208010, India</Text>
            <Text>GSTIN: 22ASD1347571Z5</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              INVOICE #{order._id}
            </Text>
            <Text>Date: {formatDate(order.createdAt)}</Text>
            <Text>Status: {order.orderStatus}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Name:</Text>{" "}
                {order.userId?.name || "Not available"}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
                {order.userId?.email || "Not available"}
              </Text>
            </View>
            <View style={styles.col}>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Phone:</Text>{" "}
                {order.shippingAddress.phone || "Not available"}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Payment:</Text>{" "}
                {order.paymentMethod}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text>
            {order.shippingAddress.addressLine1},{" "}
            {order.shippingAddress.addressLine2}
          </Text>
          <Text>Landmark: {order.shippingAddress.landmark}</Text>
          <Text>
            {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
            {order.shippingAddress.postalCode}
          </Text>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.products.map((product, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productDetails}>
                <Text style={{ fontWeight: "bold" }}>
                  {product.name || product.productId?.name}
                </Text>
                <Text>Size: {product.selectedSize}</Text>
                <Text>Qty: {product.quantity}</Text>
              </View>
              <View style={{ width: 100, alignItems: "flex-end" }}>
                <Text>₹{product.priceAtPurchase}</Text>
                <Text>Discount: {product.discountAtPurchase}%</Text>
                <Text style={{ fontWeight: "bold" }}>
                  ₹{(product.priceAtPurchase * product.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Total MRP:</Text>
            <Text>₹{totalMRP.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Discount:</Text>
            <Text>-₹{totalDiscount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery Charge:</Text>
            <Text>₹{order.deliveryCharge || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>GST:</Text>
            <Text>₹{order.gstAmount?.toFixed(2) || 0}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total Amount:</Text>
            <Text>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for shopping with us!</Text>
          <Text>
            For any queries, please contact support@luckyfootwear.com or call +91
            9876543210
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;