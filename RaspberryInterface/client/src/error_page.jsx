import { useRouteError } from "react-router-dom";

export default function ErrorPage(){
    const error = useRouteError();
    return(
        <div id="error-page">
            <p> Fehler aufgetreten</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}
