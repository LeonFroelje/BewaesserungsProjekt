import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  RouterProvider,
  Route,
  createBrowserRouter
} from "react-router-dom";
import './index.css';
import IndexRoute from './routes/indexRoute';
import Homepage from './routes/home';
import Config from './routes/config';
import Stats from './routes/stats';
import reportWebVitals from './reportWebVitals';
import ErrorPage from './error_page';

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexRoute/>,
    errorElement: <ErrorPage/>,
    children: [
       {
          path: "",
          element: <Homepage/>,
          errorElement: <ErrorPage/>
       },
       {
          path: "config",
          element: <Config/>,
          errorElement: <ErrorPage/>
       },
       {
          path: "stats",
          element: <Stats/>,
          errorElement: <ErrorPage/>
       }
    ]
  }
], {
  basename: "/"
})


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
