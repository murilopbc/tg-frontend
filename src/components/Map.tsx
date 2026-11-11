import { useState, useEffect } from "react";
import axios from "axios";
import { type MapItem } from "../interfaces/Map";
import "./Map.css";

// Tamanho de cada célula (retângulo). Ajuste conforme necessário.
const CELL_WIDTH = 40;
const CELL_HEIGHT = 20;

const Map = () => {
    const [data, setData] = useState<MapItem[] | null>(null);

    useEffect(() => {
        setData(null);

        let cancelled = false;

        const loadMap = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5137/maps?level=1`
                );

                if (cancelled) return;

                const validData = res.data.filter(
                    (item: MapItem) =>
                        !isNaN(Number(item.x)) &&
                        !isNaN(Number(item.y))
                );

                setData(validData);
            } catch (error) {
                if (cancelled) return;

                console.error("Error loading map:", error);
                setData([]);
            }
        };

        loadMap();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!data) {
        return <div className="map-status">Carregando mapa...</div>;
    }

    if (data.length === 0) {
        return <div className="map-status error">Mapa não encontrado.</div>;
    }

    // Calcula os limites do mapa
    const minX = Math.min(...data.map(item => Number(item.x)));
    const minY = Math.min(...data.map(item => Number(item.y)));
    const maxX = Math.max(...data.map(item => Number(item.x)));
    const maxY = Math.max(...data.map(item => Number(item.y)));

    const padding = 2;

    const viewBoxX = (minX - padding) * CELL_WIDTH;
    const viewBoxY = (minY - padding) * CELL_HEIGHT;

    const viewBoxWidth =
        (maxX - minX + 1 + padding * 2) * CELL_WIDTH;

    const viewBoxHeight =
        (maxY - minY + 1 + padding * 2) * CELL_HEIGHT;

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
                        item.type === 1 ||
                        item.type === "1" ||
                        item.type === true ||
                        item.type === "true";

                    const fillColor = isStorage
                        ? "#D1E4FF"
                        : "#FFFFFF";

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
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default Map;
