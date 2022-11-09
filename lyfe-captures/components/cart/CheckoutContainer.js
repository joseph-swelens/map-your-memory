import React, { useState, useEffect, Fragment } from "react";
import {
  Grid,
  Header,
  Container,
  Segment,
  Divider,
  Dropdown,
  Input,
  Button,
} from "semantic-ui-react";
import Commerce from "@chec/commerce.js";
import Link from "next/link";
import CartModal from "./CartModal";
import CheckoutForm from "./CheckoutForm";
import CheckoutItems from "./CheckoutItems";

const CheckoutContainer = (props) => {
  const commerce = new Commerce(process.env.CHEC_PK);

  const [liveObject, setLiveObject] = useState();
  const [tokenId, setTokenId] = useState();
  const [shippingOptions, setShippingOptions] = useState();
  const [shipOption, setShipOption] = useState();
  const [discountCode, setDiscountCode] = useState();
  const [noDiscountCode, setNoDiscountCode] = useState();
  const [invalidDiscountCode, setInvalidDiscountCode] = useState();
  const [openCartModal, setOpenCartModal] = useState(false);
  const [showEditCart, setShowEditCart] = useState(false);

  useEffect(() => {
    /* *** Getting Checkout Token - Set Live Object in State *** */
    let cartId = props.cart.id;
    commerce.checkout
      .generateToken(cartId, { type: "cart" })
      .then((res) => {
        console.log(res, "response from generating checkout Token");
        setTokenId(res.id);
        setLiveObject(res);
      })
      .catch((err) => {
        console.log(err);
      });

    props.setCheckout(true);
    console.log(tokenId, "token id");
  }, [showEditCart]);

  const getShippingOptions = (countrySymbol) => {
    /* 
        Getting the Customer's Shipping Options based on the Country
        Function is triggered once user selects country in CheckoutForm. 
        */

    if (countrySymbol) {
      commerce.checkout
        .getShippingOptions(tokenId, {
          country: countrySymbol,
        })
        .then((res) => {
          // console.log(res, 'res from getting Shipping options by country')
          let shippingOptionsArray = res.map((option) => {
            let shInfo = {};

            shInfo.key = countrySymbol;
            shInfo.text = `${option.description}(${option.price.formatted_with_code})`;
            shInfo.value = option.id;

            return shInfo;
          });
          setShippingOptions(shippingOptionsArray);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleDropDownShipping = (e, { value, options }) => {
    /* 
        Applies shipping option to Cart Total
        Updates Live Object in state 
        */

    commerce.checkout
      .checkShippingOption(tokenId, {
        id: value,
        country: options[0].key,
      })
      .then((res) => {
        // console.log(res, 'res from checking discount code')
        setShipOption(value);
        setLiveObject(res.live);
      })
      .catch((err) => console.log(err));
  };

  const handleDiscountCode = (e, { value }) => {
    /* Putting Discount Code in State */
    setDiscountCode(value);
  };

  const handleDiscountClick = (e) => {
    /* *** Checking to Make Sure Discount Code is Valid *** */

    e.preventDefault();

    if (!discountCode) {
      setNoDiscountCode(true);
      setInvalidDiscountCode(false);
    } else {
      commerce.checkout
        .checkDiscount(tokenId, { code: discountCode })
        .then((res) => {
          // console.log(res, 'res from checking discount code')
          if (!res.valid) {
            setInvalidDiscountCode(true);
          } else {
            setInvalidDiscountCode(false);
            setLiveObject(res.live);
            setDiscountCode(null);
          }

          setNoDiscountCode(false);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <React.Fragment>
      <Grid columns={2} centered padded>
        <Grid.Row className="checkout-row">
          <Grid.Column width={8}>
            {showEditCart && (
              <Fragment>
                <CartModal
                  token={tokenId}
                  handleCloseCart={
                    setShowEditCart
                  }
                />
              </Fragment>
            )}

            {!showEditCart && liveObject && tokenId && (
              <CheckoutForm
                liveObject={liveObject}
                tokenId={tokenId}
                shipOption={shipOption}
                getShippingOptions={getShippingOptions}
                setShipOption={setShipOption}
                setReceipt={props.setReceipt}
              />
            )}
          </Grid.Column>

          <Grid.Column width={6}>
            <Segment padded>
              <Header textAlign="center" size="huge">
                Current Cart
              </Header>

              <Header textAlign="center">
                <a
                  onClick={() => {
                    setShowEditCart(true);
                  }}
                >
                  Edit Cart
                </a>
              </Header>

              {liveObject &&
                liveObject.line_items.map((item) => (
                  <Container className="item-data-container" key={item.id}>
                    <CheckoutItems item={item} />
                  </Container>
                ))}
              <Divider horizontal>Shipping Options</Divider>

              <Dropdown
                placeholder="Select Shipping Method"
                fluid
                selection
                value={shipOption}
                onChange={handleDropDownShipping}
                options={shippingOptions || []}
              />

              {!shipOption && <p>Select Country for Shipping Options</p>}
              <Divider horizontal>Discount Code</Divider>

              <form className="discount-code" onSubmit={handleDiscountClick}>
                <Input onChange={handleDiscountCode} />
                <Button color="black">Apply</Button>
              </form>
              {noDiscountCode && <p>No Discount Code Entered</p>}
              {invalidDiscountCode && <p>Invalid Code!</p>}
              <Divider horizontal>Cart Totals</Divider>

              {liveObject && (
                <>
                  {shipOption && (
                    <Header color="olive" textAlign="center">
                      (Shipping) + {liveObject.shipping.price.formatted}
                    </Header>
                  )}
                  {liveObject.discount.length !== 0 && (
                    <Header color="olive" textAlign="center">
                      (LUCKY) - {liveObject.discount.amount_saved.formatted}
                    </Header>
                  )}
                  <Header textAlign="center" size="large">
                    {liveObject.total.formatted_with_symbol}
                  </Header>
                </>
              )}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
};

export default CheckoutContainer;
