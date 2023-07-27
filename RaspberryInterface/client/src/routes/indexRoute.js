import { Component, createContext } from "react";
import { Outlet } from "react-router-dom";
import NavbarContainer from "../components/Header/NavbarContainer";
import AnimationContainer from "../components/loadingAnimation/AnimationContainer";
import styles from "../styles/routeStyles/indexRoute.module.css";


const serverContext = createContext();

export default class IndexRoute extends Component{
    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            serverData: null
        };
    }

    componentDidMount(){
        if(! this.state.loaded){
            fetch("http://website-api.local/index/load")
            .then(data => {
                return data.json();
            })
            .then(data => {
                this.setState({
                    loaded: true,
                    serverData: data
                });
            });
        }
    }

    render(){
        if(this.state.loaded){
            return(
                <serverContext.Provider value={this.state.serverData}>
                    <NavbarContainer links={
                        [
                            {
                                path: "/",
                                name: "Home",
                                icon: "home"
                            },
                            {
                                path: "/config",
                                name: "Einstellungen",
                                icon: "setting"
                            },
                            {
                                path: "/stats",
                                name: "Statistiken",
                                icon: "stats"
                            }
                        ]}>
                    </NavbarContainer>
                    <div className={styles.appBody}>
                        <Outlet></Outlet>
                    </div>  
                </serverContext.Provider>
            )
        }
        else{
            return(
                <>
                <NavbarContainer links={
                    [
                        {
                            path: "/",
                            name: "Home",
                            icon: "home"
                        },
                        {
                            path: "/config",
                            name: "Einstellungen",
                            icon: "setting"
                        },
                        {
                            path: "/stats",
                            name: "Statistiken",
                            icon: "stats"
                        }
                    ]}>
                </NavbarContainer>
                <div className={styles.appBody}>
                    <AnimationContainer></AnimationContainer>
                </div>
                </>
            )
        }
    }
}

IndexRoute.contextType = serverContext;

export { serverContext }