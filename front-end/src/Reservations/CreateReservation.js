import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function CreateReservation(){
    const history = useHistory();
    const [error, setError] = useState(null);

    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
      };

    const [reservation, setReservation] = useState({...initialFormState});

    const handleChange = ({ target }) => {
        setReservation({
            ...reservation,
            [target.name]: target.value
        });
    };

    const submitHandler = (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        createReservation(reservation, abortController.signal)
            .then((newReservation) => history.push(`/dashboard?date=${newReservation.reservation_date.slice(0, 10)}`))
            .catch((error) => setError(error));
        return () => abortController.abort();
    };

    return (
        <>
            <div>
            <h2>New Reservation</h2>
            <ErrorAlert error={error} setError={setError}/>
            </div>
            
            <ReservationForm reservation={reservation} submitHandler={submitHandler} handleChange={handleChange} />
        </>
        );
}

export default CreateReservation;