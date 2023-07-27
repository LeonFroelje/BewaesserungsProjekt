import { Component } from "react";
import styles from "../../styles/component_styles/Navbar/Navbar.module.css"
import { AiOutlineWarning } from "react-icons/ai"

export default class Warning extends Component{
    constructor(props){
        super(props);
        //this.warningSource = new EventSource()
    }
    componentDidMount(){

    }


    render(){
        return (
        <>
            <div className={styles.warningContainer}><AiOutlineWarning></AiOutlineWarning></div>
        </>
        )
    }
}