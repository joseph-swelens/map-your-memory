import { Card, Paper } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardOverlay from "./CardOverlay";
import classes from "./CreateMap.module.css";
// const DEFAULT_CENTER = [38.907132, -77.036546];
import CustomizedAccordions from "./StyleAccordion/CustomizedAccordion";
const SIZE_OPTION = "_24_36";
const MATERIAL_OPTION = "POSTER"; 
import { MapConstants } from "./MapFolder/MapConstants";
import { mapActions } from "../../store/map-slice";

import { AddToCartButton, BuyNowButton } from "../ui/CustomButtons";
import { useRouter } from "next/router";
import Commerce from "@chec/commerce.js";

const commerce = new Commerce(process.env.CHEC_PK);

const CreateMap = (props) => {
  const orientation = useSelector((state) => state.map.orientation);
  const defaultCenter = useSelector((state) => state.map.lngLat);
  const primaryText = useSelector((state) => state.map.textPrimary);
  const secondaryText = useSelector((state) => state.map.textSecondary);
  const addLngLat = useSelector((state) => state.map.addLngLat);
  const zoom = useSelector((state) => state.map.zoom);
  const router = useRouter(); 
  const color = useSelector((state) => state.map.color);
  const sizeOption = SIZE_OPTION; 

  const optionObj = MapConstants.poster_size[SIZE_OPTION];
  const height = optionObj.portrait.map_height * optionObj.poster_multiplier;
  const width = optionObj.portrait.map_width * optionObj.poster_multiplier;
  const [mapStyle, setMapStyle] = useState({
    width: width.toString() + "px",
    height: height.toString() + "px",
  });

  const dispatch = useDispatch(); 

  useEffect(() => {
    if (orientation === "portrait") {
      // Map Size.

      const optionObj = MapConstants.poster_size[SIZE_OPTION];
      const height =
        optionObj.portrait.map_height * optionObj.poster_multiplier;
      const width = optionObj.portrait.map_width * optionObj.poster_multiplier;
      setMapStyle({
        width: width.toString() + "px",
        height: height.toString() + "px",
      });
      if (
        !addLngLat &&
        primaryText.length === 0 &&
        secondaryText.length === 0
      ) {
        setMapStyle({
          height:
            (
              (optionObj.full_height - 1) *
              optionObj.poster_multiplier
            ).toString() + "px",
          width:
            (
              (optionObj.full_width - 1) *
              optionObj.poster_multiplier
            ).toString() + "px",
        });
      }
    } else {
      //Landscape Calculate Map Size.
      const optionObj = MapConstants.poster_size[SIZE_OPTION];
      const height =
        optionObj.landscape.map_height * optionObj.poster_multiplier;
      const width = optionObj.landscape.map_width * optionObj.poster_multiplier;

      setMapStyle({
        width: width.toString() + "px",
        height: height.toString() + "px",
      });

      if (
        !addLngLat &&
        primaryText.length === 0 &&
        secondaryText.length === 0
      ) {
        setMapStyle({
          height:
            (
              (optionObj.full_width - 1) *
              optionObj.poster_multiplier
            ).toString() + "px",
          width:
            (
              (optionObj.full_height - 1) *
              optionObj.poster_multiplier
            ).toString() + "px",
        });
      }
    }
  }, [orientation, defaultCenter, addLngLat, primaryText, secondaryText]);

  const handleAddToCart = (event) => {
    event.preventDefault();
    console.log("handleAddToCart");
    dispatch(mapActions.addMapToCart({}));

    commerce.products
      .list()
      .then((res) => {

        let prod = res.data.find((p) => p.name === "Personalized Map");
        // get prod id
        let prodId = prod.id;
        let variantInfo = {
          Size: MapConstants.poster_size[SIZE_OPTION].variant_size,
          Material: MATERIAL_OPTION,
        }

        // add to prod cart 
        commerce.cart.add(prodId, 1).then((res) => {
          console.log("res", res);
          router.push("/cart");
        }).catch((err) => {
          console.log("err", err);
        });
        // redirect to cart page
      })
      .catch((err) => console.log(err));
  };

  const handleBuyNow = (event) => {
    event.preventDefault();
    console.log("handleBuyNow");
    dispatch(mapActions.addMapToCart({}));
    // commerce.
    router.push("/cart");
  };

  const MapWithNoSSR = dynamic(() => import("./MapFolder/Map"), {
    ssr: false,
  });

  return (
    <div className={classes.container}>
      <Paper elevation={24} className={classes.wrapper}>
        <CardOverlay>
          <MapWithNoSSR center={defaultCenter} zoom={zoom} style={mapStyle}>
            {/* {({ TileLayer, Marker, Popup }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={defaultCenter} draggable={true} animate={true}>
                  <Popup>Hey ! you found me</Popup>
                </Marker>
              </>
            )} */}
          </MapWithNoSSR>
        </CardOverlay>
      </Paper>
      <Paper elevation={24} className={classes.accordionBox}>
        <CustomizedAccordions />
        <div className={classes.actionBtns}>
          <BuyNowButton onClick={handleBuyNow}>
            Buy Now
          </BuyNowButton>
          <AddToCartButton
            onClick={handleAddToCart}
          >
            Add To Cart
          </AddToCartButton>
        </div>
      </Paper>
    </div>
  );
};
export default CreateMap;
