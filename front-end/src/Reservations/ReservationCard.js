import React from "react";

function ReservationCard({reservation_id,
    first_name, 
    last_name, 
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
    setReservationsError,
    loadReservations
    }){

        return (
            <div className="card">

                <h4 className="card-header">
                    {first_name}, {last_name} Status:{status === "booked"}
                <button href={`/reservations/${reservation_id}/edit`}>Edit</button>
                </h4>

                <div className="card-body">
                    <h5>Date: {reservation_date} Time: {reservation_time}</h5>
                    <h6>Size of party: {people}</h6>
                    <h6>Contact number: {mobile_number}</h6>
                </div>


            </div>
        );

}

export default ReservationCard;