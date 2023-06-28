/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
const { today } = require("../utils/date-time");

async function list(req, res) {
  if (req.query.date){
    const data = await service.list(req.query.date);
    res.json({ data });
  } 
    else {
    const data = await service.list(today());
    res.json({ data });
  }

}

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

function hasData(req, res, next){
  if(req.body.data){
      return next();
  }
  next({status: 400, message:"Body must have a data property"});
}

function hasValidProperties(req, res, next){
  const { data = {} } = req.body;
  const invalidProperties = Object.keys(data).filter((item) =>
   !VALID_PROPERTIES.includes(item));
   if(invalidProperties.length){
    next({status: 400, message: `Invalid item(s): ${invalidProperties.join(",")}`});
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
  const { data: {reservation_date} = {} } = req.body;
  const dateProps = new RegExp(/(?<=\D|^)(?<year>\d{4})(?<sep>[^\w\s])(?<month>1[0-2]|0[1-9])\k<sep>(?<day>0[1-9]|[12][0-9]|(?<=11\k<sep>|[^1][4-9]\k<sep>)30|(?<=1[02]\k<sep>|[^1][13578]\k<sep>)3[01])(?=\D|$)/gm);
  if(!reservation_date.match(dateProps)){
    next({ status: 400, message: "reservation_date"});
  } 
  next();
}

function hasValidTime(req, res, next){
  const {reservation_time} = req.body.data;
  const time = new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
  if(!reservation_time || reservation_time === "" || !reservation_time.match(time)){
    next({status: 400, message: "reservation_time"});
  }
  next();
}

function peopleIsNumber(req, res, next){
  const {data: {people} = {} } = req.body;
  if(!Number.isInteger(people)){
    next({ status: 400, message:"people"});
  }
  next();
}
//checks if restaurant is open(not tuesday)
function isNotTuesday(req, res, next){
  const {reservation_date} = req.body.data;
  const date = reservation_date.split("-");
  const dateAsNum = new Date(
    Number(date[0]),
    Number(date[1]) - 1,
    Number(date[2]),
    0,
    0,
    1
  );
  if(dateAsNum.getDay() === 2){
    next({ status: 400, message: "I'm sorry. The restaurant is closed on Tuesdays."});
  } else {
    next();
  }
}
//checks if reservation has a future date
function isFutureDate(req, res, next){
  const {reservation_date, reservation_time} = req.body.data;
  const [hour, minute] = reservation_time.split(":");
   let [year, month, day] = reservation_date.split("-");
   month -= 1;
   const resDate = new Date(year, month, day, hour, minute, 59, 59).getTime();
   const today = new Date().getTime();

   if(resDate > today){
    next();
   } else {
    next({ status: 400, message: "Reservation must be set in the future."});
   }
};

async function create(req, res){
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

async function reservationExists(req, res, next){
  const reservation_id = req.params.reservation_id;
  const reservation = await service.read(reservation_id);
  if(reservation){
    res.locals.reservation = reservation;
    return next();
  }
  next({status: 404, message: `Reservation ${reservation_id} does not exist.`})
}

function read(req, res){
  const data = res.locals.reservation;
  res.json({ data })
}

module.exports = {
  create: [hasData, hasValidProperties,
    hasProperties("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people"),
    hasValidDate,
    peopleIsNumber,
    hasValidTime,
    isNotTuesday,
    isFutureDate,
    asyncErrorBoundary(create)],
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(reservationExists),
  read],
};
