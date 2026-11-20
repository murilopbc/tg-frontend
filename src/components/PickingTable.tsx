import { type PickingItem } from "../interfaces/Picking";
import "./PickingTable.css";

interface PickingTableProps {
    pickings: PickingItem[];
}
const PickingTable = ({ pickings }: PickingTableProps) => {
    if (pickings.length === 0) {
        return <div className="map-status">Nenhum acesso no período selecionado.</div>;
    }

    return (
        <div className="picking-table-wrapper">
            <table className="picking-table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Acessos</th>
                        <th>Posição</th>
                        <th>Curva do produto</th>
                        <th>Curva da posição</th>
                    </tr>
                </thead>
                <tbody>
                    {pickings.map((p, i) => (
                        <tr key={`${p.map_Id}-${p.product}--${i}`}>
                            <td>{p.product}</td>
                            <td>{p.quantity}</td>
                            <td>{p.location}</td>
                            <td>{p.curva_Produto}</td>


                            <td>
                                <span className={`curve-badge curve-${p.curva_Posicao}`}>
                                    {p.curva_Posicao}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PickingTable;