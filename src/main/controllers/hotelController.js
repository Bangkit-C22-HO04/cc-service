import { PrismaClient } from "@prisma/client";
import { toTitleCase } from "../functions/toTitleCase.js";

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
      location: hotel.name,
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

    const ranking = await prisma.hotel.findMany({
      where: {
        location: toTitleCase(req.body.location),
      },
      orderBy: {
        rating: "desc",
      },
      take: 5,
    });

    ranking.forEach((element, index) => {
      ranking[index]["id"] = parseInt(element["id"]) 
      ranking[index]["rating"] = parseFloat(element["rating"])
    })

    return res.status(200).json({ data: ranking });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An Error Occured" });
  }
};

export default {
  getHotel: getHotel,
  hotelRanking: hotelRanking,
};
