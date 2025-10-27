export default function Footer() {
  return (
    <footer className="mt-10 bg-bg-secondary border-t border-border-light">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-text-secondary flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Tu Marca. Todos los derechos reservados.</p>
        <nav className="flex items-center gap-4">
          <a href="#" className="hover:text-selected">Términos</a>
          <a href="#" className="hover:text-selected">Privacidad</a>
          <a href="#" className="hover:text-selected">Contacto</a>
        </nav>
      </div>
    </footer>
  );
}


