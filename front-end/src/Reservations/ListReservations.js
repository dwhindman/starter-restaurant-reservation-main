import React from "react";
import ReservationCard from "./ReservationCard";

function ListReservations({reservations, setReservationsError, loadReservations}){

    return (
        reservations.map((reservation) =>
                <div>
                        <ReservationCard 
                        reservation_id={reservation.reservation_id}
                        first_name={reservation.first_name}
                        last_name={reservation.last_name} 
                        mobile_number={reservation.mobile_number}
                        reservation_date={reservation.date}
                        reservation_time={reservation.reservation_time}
                        people={reservation.people}
                        status={reservation.status}
                        setReservationsError={setReservationsError}
                        loadReservations={loadReservations} />
                </div>
    ));

}

export default ListReservations;