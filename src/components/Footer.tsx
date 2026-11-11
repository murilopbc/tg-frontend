import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer-container">
            <p className="footer-text">
                © {new Date().getFullYear()} Mapa do Armazém. Todos os direitos reservados.
            </p>
        </footer>
    );
}
