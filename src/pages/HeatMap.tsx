
import { useState, useEffect } from "react";
import axios from "axios";
import "./HeatMap.css";
import Map from "../components/Map";
import PickingTable from "../components/PickingTable";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { type PickingItem } from "../interfaces/Picking";

const CURVAS = ["ALL", "A", "B", "C", "D"] as const;
type CurvaFiltro = (typeof CURVAS)[number];

const NIVEIS = [1, 2];

// Cores das curvas ABCD
const TEST_COLORS: Record<string, string> = {
    A: "#8E24AA", // Roxo
    B: "#E53935", // Vermelho
    C: "#FDD835", // Amarelo
    D: "#43A047"  // Verde
};

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
                    {
                        params: {
                            dataInicial,
                            dataFinal,
                            curva,
                            nivel
                        }
                    }
                );

                if (!cancelled) {
                    setPickings(res.data);
                }
            } catch (error) {
                if (cancelled) return;

                console.error("Error loading heatmap:", error);
                setPickings([]);
            }
        };

        loadPickings();

        return () => {
            cancelled = true;
        };
    }, [dataInicial, dataFinal, curva, nivel]);

    return (
        <>
            <Header />

            <div className="heatmap-filters">
                <label>
                    De:
                    <input
                        type="date"
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                    />
                </label>

                <label>
                    Até:
                    <input
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                    />
                </label>

                <label>
                    Curva:
                    <select
                        value={curva}
                        onChange={(e) =>
                            setCurva(e.target.value as CurvaFiltro)
                        }
                    >
                        {CURVAS.map((c) => (
                            <option key={c} value={c}>
                                {c === "ALL" ? "Todas" : `Curva ${c}`}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Nível:
                    <select
                        value={nivel}
                        onChange={(e) => setNivel(Number(e.target.value))}
                    >
                        {NIVEIS.map((n) => (
                            <option key={n} value={n}>
                                Nível {n}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Legenda das curvas */}
           {/* Legenda das curvas */}
<div
    className="heatmap-legend"
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gridTemplateRows: "repeat(2, auto)",
        gridAutoFlow: "column", // A,B na esquerda; C,D na direita
        gap: "16px 48px",
        padding: 16,
        background: "#ffffff",
        border: "1px solid #e2e6ec",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
    }}
>
    {[
        { c: "A", label: "até 80% do total acumulado", corte: pickings[0]?.corte_Posicao_A },
        { c: "B", label: "de 80% a 90% do total acumulado", corte: pickings[0]?.corte_Posicao_B },
        { c: "C", label: "de 90% a 95% do total acumulado", corte: pickings[0]?.corte_Posicao_C },
        { c: "D", label: "acima de 95% do total acumulado", corte: pickings[0]?.corte_Posicao_D },
    ].map(({ c, label, corte }) => (
        <div
            key={c}
            className="heatmap-legend-item"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
            <span
                className="heatmap-legend-color"
                style={{
                    display: "block",
                    width: 18,
                    height: 45,
                    flexShrink: 0,
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.15)",
                    backgroundColor: TEST_COLORS[c],
                }}
            />

            <div
                className="heatmap-legend-text"
                style={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
                <strong style={{ fontSize: 14, color: "#1f2937" }}>Curva {c}</strong>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
                <small style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>
                    {corte != null ? `Maior que ${corte} acessos` : "Sem dados"}
                </small>
            </div>
        </div>
    ))}
</div>

            <Map
                pickings={pickings}
                nivel={nivel}
            />

            <PickingTable pickings={pickings} />

            <Footer />
        </>
    );
}
