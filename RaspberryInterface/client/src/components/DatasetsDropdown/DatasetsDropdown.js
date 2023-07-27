import { Component, createRef} from "react";
import SelectableDropdownRow from "../Dropdown/SelectableDropdownRow";
import styles from "../../styles/component_styles/DatasetsDropdown/DatasetsDropdown.module.css"
import DropdownHead from "../Dropdown/DropdownHead";
import DropdownBody from "../Dropdown/DropdownBody";
import { serverContext } from "../../routes/indexRoute";
import DropdownRow from "../Dropdown/DropdownRow";


export default class DatasetsDropdown extends Component{
    constructor(props){
        super(props);
        this.state = {
            dropped : false,
        };
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
    

    createRows = () => {
        const rows = this.context.rooms.map(room => {
            return (
                <DropdownRow rowName={room.name} key={room.id}
                nestedRows={room.controllers.map(controller => {
                    return (
                        <DropdownRow rowName={controller.name} key={controller.id}
                        nestedRows={
                            <>
                            <SelectableDropdownRow handleRowClick={this.props.handleRowClick}
                            selected={this.props.selectedRows[controller.name + "-DHT11"]}
                            rowName={controller.name + "-DHT11"}
                            rowContent="DHT11"/>
                            
                            {controller.plants.map(plant => {
                                return (<SelectableDropdownRow handleRowClick={this.props.handleRowClick}
                                        selected={this.props.selectedRows[`${controller.name}-${plant.name}-${plant.id}`]}
                                        rowName={`${controller.name}-${plant.name}-${plant.id}`}
                                        rowContent={plant.name}
                                        key={plant.id}/>
                                    )
                                })}
                            </>
                        }>
                        </DropdownRow>
                        )
                    })}>
                    
                </DropdownRow>
            )
        })
        return rows
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
    
    render(){
        let selectedItems = [];
        for(const [item, isSelected] of Object.entries(this.props.selectedRows)){
            if(isSelected){
                selectedItems.push(item)
            }
        }
        selectedItems = selectedItems.length > 2 ? selectedItems.slice(0, 2).concat([`+${selectedItems.length - 2}`])
          : selectedItems;
        if(this.state.dropped){
            return(
                <div ref={this.menuWrapper} className={styles.menu}>
                    <DropdownHead toggleMenuDrop={this.toggleMenuDrop} label="Datensätze"
                    selectedItems={selectedItems} dropped={true}
                    placeholder="Datensätze auswählen"/>
                    <DropdownBody rows={this.createRows()}></DropdownBody>
                </ div>
                )
        }
        return(
            <div ref={this.menuWrapper} className={styles.menu}>
                <DropdownHead toggleMenuDrop={this.toggleMenuDrop} label="Datensätze"
                selectedItems={selectedItems} dropped={false}
                placeholder="Datensätze auswählen"/>
            </div>
        )
    }
}

DatasetsDropdown.contextType = serverContext