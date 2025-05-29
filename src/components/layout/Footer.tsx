export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 bg-transparent border-t border-border/20">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Hommie.cl AI. Prototipo.
        </p>
      </div>
    </footer>
  );
}
