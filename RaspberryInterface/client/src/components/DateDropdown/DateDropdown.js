import { Component, createRef } from "react";
import styles from "../../styles/component_styles/DateDropdown/DateDropdown.module.css"
import DropdownHead from "../Dropdown/DropdownHead";
import DropdownBody from "../Dropdown/DropdownBody";
import SelectableDropdownRow from "../Dropdown/SelectableDropdownRow";


export default class DateDropdown extends Component{
    constructor(props){
        super(props);
        this.state = {
            dropped : false,
        }
        this.menuWrapper = createRef();
    }

    clickedOutside = (e) => {
        if(this.menuWrapper && !this.menuWrapper.current.contains(e.target)){
            this.setState({
                dropped : false
            });
        }
    }

    componentDidMount(){
        document.addEventListener("click", this.clickedOutside);
    }

    componentWillUnmount(){
        document.removeEventListener("click", this.clickedOutside)
    }

    toggleMenuDrop = () => {
        if(this.state.dropped){
            this.setState({
                dropped: false
            })
        }
        else{
            this.setState({
                dropped: true
            })
        }
    }

    createRows = () => {
        return this.props.rows.map(row => {
            if(this.props.selectedRow === row.name){
                return <SelectableDropdownRow selected={true}
                key={row.name} handleRowClick={this.props.handleRowClick}
                rowName={row.name}
                rowContent={row.name}></SelectableDropdownRow>;
            }
            return <SelectableDropdownRow selected={false}
            key={row.name} handleRowClick={this.props.handleRowClick}
            rowName={row.name}
            rowContent={row.name}></SelectableDropdownRow>;
        })
    }

    render(){
        if(this.state.dropped){
            return <div ref={this.menuWrapper} className={styles.menu}>
                <DropdownHead selectedItems={this.props.selectedRow ? [this.props.selectedRow] : []}
                 toggleMenuDrop={this.toggleMenuDrop} label="Zeitraum"
                 placeholder="Zeitraum auswählen" dropped={true}/>
                <DropdownBody rows={this.createRows()}></DropdownBody>
            </div>
        }
        return <div ref={this.menuWrapper} className={styles.menu}>
            <DropdownHead selectedItems={this.props.selectedRow ? [this.props.selectedRow] : []}
            toggleMenuDrop={this.toggleMenuDrop} label="Zeitraum"
            placeholder="Zeitraum auswählen" dropped={false}/>
        </div>
    }

}