import { useState, useEffect } from "react";
import { type PickingItem } from "../interfaces/Picking";
import "./PickingTable.css";

interface PickingTableProps {
    pickings: PickingItem[];
}

const PAGE_SIZES = [10, 25, 50, 100];

const PickingTable = ({ pickings }: PickingTableProps) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const pickingsForaDoLugar = pickings.filter(
        (p) => p.fora_Do_Lugar === 1
    );

    const totalItems = pickingsForaDoLugar.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // volta para a página 1 quando os dados ou o tamanho da página mudam
    useEffect(() => {
        setPage(1);
    }, [pickings, pageSize]);

    if (totalItems === 0) {
        return <div className="map-status">Nenhum produto fora do lugar.</div>;
    }

    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    const pageItems = pickingsForaDoLugar.slice(start, end);

    return (
        <div className="picking-table-wrapper">
            <table className="picking-table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Acessos</th>
                        <th>Posição</th>
                        <th>Curva atual</th>
                        <th>Curva sugerida</th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.map((p, i) => (
                        <tr key={`${p.map_Id}-${p.product}--${start + i}`}>
                            <td>{p.product}</td>
                            <td>{p.quantity}</td>
                            <td>{p.location}</td>
                            <td>
                                <span className={`curve-badge curve-${p.curva_Posicao}`}>
                                    {p.curva_Posicao}
                                </span>
                            </td>
                            <td>{p.curva_Sugerida}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="picking-pagination">
                <label>
                    Linhas por página:
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        {PAGE_SIZES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>

                <span>
                    {start + 1}–{end} de {totalItems}
                </span>

                <div className="picking-pagination-buttons">
                    <button
                        onClick={() => setPage(1)}
                        disabled={currentPage === 1}
                    >
                        «
                    </button>
                    <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Próxima
                    </button>
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickingTable;