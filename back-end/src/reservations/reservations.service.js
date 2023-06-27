const knex = require("../db/connection");

function list(){
    return knex("reservations")
        .select("*")
        .where({"reservation_date": date} )
        .andWhereNot({"status": finished })
        .orderBy("reservation_time");
}

function create(newReservation){
    return knex("reservations")
        .insert(newReservation)
        .returning("*")
        .then(createdReservation => createdReservation[0]);
}

function read(reservation_date){
    return knex("reservations")
        .select("*")
        .where({"reservation_date": reservation_date})
        .first();
}

module.exports = {
    create,
    list,
    read,
    
}