import { useState, useEffect } from "react";
import axios from "axios";
import "./Heatmap.css";
import Map from "../components/Map";
import PickingTable from "../components/PickingTable";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { type PickingItem } from "../interfaces/Picking";

const CURVAS = ["ALL", "A", "B", "C", "D"] as const;
type CurvaFiltro = (typeof CURVAS)[number];

const NIVEIS = [1, 2]; // AJUSTAR para os níveis que existem no seu armazém

export default function HeatMap() {
    const [dataInicial, setDataInicial] = useState("2023-10-18");
    const [dataFinal, setDataFinal] = useState("2023-11-18");
    const [curva, setCurva] = useState<CurvaFiltro>("ALL");
    const [nivel, setNivel] = useState<number>(2);
    const [pickings, setPickings] = useState<PickingItem[]>([]);

    useEffect(() => {
        if (!dataInicial || !dataFinal) {
            setPickings([]);
            return;
        }

        let cancelled = false;

        const loadPickings = async () => {
            try {
                const res = await axios.get<PickingItem[]>(
                    "http://localhost:5137/heatmap",
                    { params: { dataInicial, dataFinal, curva } }
                );
                if (!cancelled) setPickings(res.data);
            } catch (error) {
                if (cancelled) return;
                console.error("Error loading heatmap:", error);
                setPickings([]);
            }
        };

        loadPickings();
        return () => { cancelled = true; };
    }, [dataInicial, dataFinal, curva]);

    return (
        <>
            <Header />

            <div className="heatmap-filters">
                <label>
                    De:
                    <input type="date" value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)} />
                </label>
                <label>
                    Até:
                    <input type="date" value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)} />
                </label>
                <label>
                    Curva:
                    <select value={curva}
                        onChange={(e) => setCurva(e.target.value as CurvaFiltro)}>
                        {CURVAS.map((c) => (
                            <option key={c} value={c}>
                                {c === "ALL" ? "Todas" : `Curva ${c}`}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Nível:
                    <select value={nivel}
                        onChange={(e) => setNivel(Number(e.target.value))}>
                        {NIVEIS.map((n) => (
                            <option key={n} value={n}>Nível {n}</option>
                        ))}
                    </select>
                </label>
            </div>

            <Map pickings={pickings} nivel={nivel} />
            <PickingTable pickings={pickings} />
            <Footer />
        </>
    );
}