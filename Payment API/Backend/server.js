const cors = require("cors");
const express = require("express");
const { default: Stripe } = require("stripe");
const stripe = require("stripe")(
  "sk_test_51JBK3USF3l1qkLcaWIC0tBrDcErQIGr1K8zeuYCQ0lL9EqUkZfRi1EnRj3oQ9CF2Vr1z2UZwhFkiCoqtsbKEZWRu008TOcS0Ar"
);
const uuid = require("uuid");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("working");
});

app.post("/payment", (req, res) => {
  console.log(req.body);
  const { product, token } = req.body;
  //   console.log('product', product.name);
  //   console.log('price', product.price);
  const idempontencyKey = uuid();

  return stripe.CustomersResource.create({
    email: token.email,
    source: token.id,
  })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: product.name,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempontencyKey }
      );
    })
    .then((result) => console.log(result), res.status(200).json(result))
    .catch((err) => console.log(err));
});

app.listen(5001, () => {
  console.log("listening on port 5001");
});
