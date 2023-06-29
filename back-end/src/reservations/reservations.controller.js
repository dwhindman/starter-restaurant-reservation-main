/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// check for valid reservation properties
const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at"
];

function hasValidProperties(req, res, next){
  const { data = {} } = req.body;
  const invalidProperties = Object.keys(data).filter((item) =>
   !VALID_PROPERTIES.includes(item));
   if(invalidProperties.length){
    return next({status: 400, message: `Invalid item(s): ${invalidProperties.join(", ")}`});
   }
   next();
}

function hasProperties(...properties){
  return function(req, res, next){
    const { data = {} } = req.body;
    try{
      properties.forEach((property) => {
        if(!data[property]){
          const error = new Error(`${property} is required.`);
          error.status = 400;
          throw error;
        }
      });
      next();
    } catch(error){
      next(error);
    }
  };
}
//check for property limitations
function hasValidDate(req, res, next){
  const { data = {} } = req.body;
  const date = data["reservation_date"];
  const time = data["reservation_time"];
  const formattedDate = new Date(`${date}T${time}`);
  const day = new Date(date).getUTCDay();

  if(isNaN(Date.parse(data["reservation_date"]))){
    return next({ status: 400, message: "reservation_date"});
  }
  if(day === 2) {
    return next({ status: 400, message: "I'm sorry. The restaurant is closed on Tuesdays."})
  }
  if(formattedDate <= new Date()){
    return next({ status: 400, message: "Reservation must be set in the future."})
  }
  next();
}

function hasValidTime(req, res, next){
  const { data = {} } = req.body;
  const time = data["reservation_time"];
  if(!/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(time)){
    next({status: 400, message: "reservation_time"});
  }
  
  const hours = Number(time.split(":")[0]);
  const minutes = Number(time.split(":")[1]);

  if(hours < 10 || (hours === 10 && minutes < 30)){
    next({ status: 400, message: "Reservation must be after 10:30 AM" });
  }
  if(hours > 21 || (hours === 21 && minutes > 30)){
    next({ status: 400, message: "Reservation must be before 9:30 PM"});
  }
  
  next();
}

function peopleIsNumber(req, res, next){
  const {data = {} } = req.body;
  if(data["people"] === 0 || !Number.isInteger(data["people"])){
    return next({ status: 400, message:"people"});
  }
  next();
}

async function list(req, res) {
  const date = req.query.date
  const mobile_number = req.query.mobile_number;
  const data = await (date ? service.list(date) : service.search(mobile_number));
  res.json({data});

}

async function create(req, res){
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function reservationExists(req, res, next){
  const reservation_id = req.params.reservation_id || (req.body.data || {}).reservation_id;
  const reservation = await service.read(reservation_id);
  if(reservation){
    res.locals.reservation = reservation;
    return next();
  }
  next({status: 404, message: `Reservation ${reservation_id} does not exist.`})
}

async function read(req, res){
  const data = res.locals.reservation;
  res.json({ data })
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)],
  create: [ 
    hasProperties("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people"),
    hasValidProperties,
    hasValidDate,
    hasValidTime,
    peopleIsNumber,
    asyncErrorBoundary(create)],
};
