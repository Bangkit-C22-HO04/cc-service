import { PrismaClient } from "@prisma/client";
import { toTitleCase } from "../functions/toTitleCase.js";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const getHotel = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(404).json({ message: "Hotel ID must be filled" });
    }

    const hotel = await prisma.hotel.findUnique({
      where: {
        id: BigInt(req.body.id),
      },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ message: `Hotel with ${req.body.id} not found` });
    }

    const review = await prisma.review.findMany({
      where: {
        hotel_id: req.body.id,
      },
      orderBy: {
        rating: "desc",
      },
      take: 3,
      select: {
        name: true,
        rating: true,
        travel_purposes: true,
        content: true,
        id: true,
      },
    });

    const objBuilder = {
      id: parseInt(hotel.id),
      name: hotel.name,
      location: hotel.location,
      price: hotel.price,
      total_rating: parseFloat(hotel.rating),
      total_review: hotel.total_review,
      image_url: hotel.image_url,
      type: hotel.type,
      ratings: review,
    };

    return res.status(200).json({ data: objBuilder });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An Error Occured" });
  }
};

const hotelRanking = async (req, res) => {
  try {
    if (!req.body.travel_purposes || !req.body.location) {
      return res
        .status(404)
        .json({ message: "travel purposes and location must be filled" });
    }

    if (req.body.location.split(" ").length != 1) {
      let arr = req.body.location.split(" ");
      req.body.location = arr[arr.length - 1];
    }

    const ranking = await prisma.hotel.findMany({
      where: {
        location: toTitleCase(req.body.location),
      },
      select: {
        id: true,
      },
    });

    const hotelIdArray = ranking.map((val) => {
      return parseInt(val.id).toString();
    });

    const response = await fetch(
      "https://ml-api-2ywgebensa-as.a.run.app/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotel_ids: hotelIdArray,
          device: true,
          travel_purpose: toTitleCase(req.body.travel_purposes),
          gender: 0,
        }),
      }
    );

    if (!response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return res.status(500).json({ message: "ML API Error" });
    }

    const responseData = await response.json();

    const dataHotel = await prisma.hotel.findMany({
      where: {
        id: { in: responseData.hotel_ids },
      },
    });

    dataHotel.forEach((element, index) => {
      dataHotel[index]["id"] = parseInt(element["id"]);
      dataHotel[index]["rating"] = parseFloat(element["rating"]);
    });

    let arr_ordered = [];

    for (let i = 0; i < responseData.hotel_ids.length; i++) {
      for (let j = 0; j < dataHotel.length; j++) {
        if (responseData.hotel_ids[i] == dataHotel[j].id) {
          arr_ordered.push(dataHotel[j])
          break
        }
      }
    }

    return res.status(200).json({ data: arr_ordered });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An Error Occured" });
  }
};

export default {
  getHotel: getHotel,
  hotelRanking: hotelRanking,
};