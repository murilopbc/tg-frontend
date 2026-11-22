import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { type MapItem } from "../interfaces/Map";
import { type PickingItem } from "../interfaces/Picking";
import "./Map.css";

const CELL_WIDTH = 40;
const CELL_HEIGHT = 20;

const CURVE_COLORS: Record<string, string> = {
    A: "#E53935", // Vermelho
    B: "#FDD835", // Amarelo
    C: "#43A047", // Verde
};

interface MapProps {
    pickings: PickingItem[];
    nivel: number;
}

interface PositionInfo {
    curva: string;
    curvaLocations: string;
    total: number;
    corteA: number;
    corteB: number;
    corteC: number;
    corteD: number;
    items: PickingItem[];
}

const Map = ({ pickings, nivel }: MapProps) => {
    const [data, setData] = useState<MapItem[] | null>(null);

    // Carrega o mapa (recarrega quando o nível muda)
    useEffect(() => {
        let cancelled = false;
        setData(null); // mostra "Carregando mapa..." enquanto troca de nível

        const loadMap = async () => {
            try {
                const res = await axios.get("http://localhost:5137/maps", {
                    params: { level: nivel },
                });
                if (cancelled) return;

                const validData = res.data.filter(
                    (item: MapItem) =>
                        !isNaN(Number(item.x)) && !isNaN(Number(item.y))
                );
                setData(validData);
            } catch (error) {
                if (cancelled) return;
                console.error("Error loading map:", error);
                setData([]);
            }
        };

        loadMap();
        return () => { cancelled = true; };
    }, [nivel]);

    // Map_Id -> dados da posição + todos os produtos que passaram por ela.
    // Curvas, total e cortes são iguais em todas as linhas da posição,
    // então pego da primeira.
    const positionInfo = useMemo(() => {
        const info: Record<number, PositionInfo> = {};
        for (const p of pickings) {
            if (!info[p.map_Id]) {
                info[p.map_Id] = {
                    curva: p.curva_Posicao,
                    curvaLocations: p.curva_Locations,
                    total: p.total_Posicao,
                    corteA: p.corte_Posicao_A,
                    corteB: p.corte_Posicao_B,
                    corteC: p.corte_Posicao_C,
                    corteD: p.corte_Posicao_D,
                    items: [],
                };
            }
            info[p.map_Id].items.push(p);
        }

        // produtos com maior quantidade primeiro
        for (const key in info) {
            info[key].items.sort((a, b) => b.quantity - a.quantity);
        }
        return info;
    }, [pickings]);

    if (!data) return <div className="map-status">Carregando mapa...</div>;
    if (data.length === 0) return <div className="map-status error">Mapa não encontrado.</div>;

    const minX = Math.min(...data.map(i => Number(i.x)));
    const minY = Math.min(...data.map(i => Number(i.y)));
    const maxX = Math.max(...data.map(i => Number(i.x)));
    const maxY = Math.max(...data.map(i => Number(i.y)));

    const padding = 2;
    const viewBoxX = (minX - padding) * CELL_WIDTH;
    const viewBoxY = (minY - padding) * CELL_HEIGHT;
    const viewBoxWidth = (maxX - minX + 1 + padding * 2) * CELL_WIDTH;
    const viewBoxHeight = (maxY - minY + 1 + padding * 2) * CELL_HEIGHT;

    const SEPARADOR = "--------------------";

    const buildTooltip = (item: MapItem, info: PositionInfo) =>
        [
            `Posição: ${item.street}${item.position}`,
            `Total de acessos: ${info.total}`,
            ...info.items.flatMap((p) => [
                SEPARADOR,
                `Produto: ${p.product}`,
                `Acessos: ${p.quantity}`,
                `Curva do produto: ${p.curva_Produto || "-"}`,
                ...(p.fora_Do_Lugar === 1
                    ? [`Curva sugerida: ${p.curva_Sugerida || "-"}`]
                    : []),
            ]),
        ].join("\n");

    return (
        <div className="map-container">
            <svg
                width="100%"
                height="100%"
                viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {data.map((item) => {
                    const x = Number(item.x) * CELL_WIDTH;
                    const y = Number(item.y) * CELL_HEIGHT;

                    const isStorage =
                        item.type === 1 || item.type === "1" ||
                        item.type === true || item.type === "true";

                    const info = positionInfo[item.id];
                    const baseColor = isStorage ? "#FFFFFF" : "#D1E4FF";
                    const fillColor = info
                        ? CURVE_COLORS[info.curva] ?? baseColor
                        : baseColor;

                    return (
                        <rect
                            key={item.id}
                            x={x}
                            y={y}
                            width={CELL_WIDTH}
                            height={CELL_HEIGHT}
                            fill={fillColor}
                            stroke="#BDBDBD"
                            strokeWidth={0.5}
                        >
                            {info && <title>{buildTooltip(item, info)}</title>}
                        </rect>
                    );
                })}
            </svg>
        </div>
    );
};

export default Map;