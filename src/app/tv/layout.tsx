/**
 * Layout voor alle /tv-schermen (kioskmodus op de tv). Verbergt de muiscursor:
 * de tv is een passief kioskscherm zonder muis, dus een zichtbare cursor hoort
 * er niet. `cursor: none` erft door naar alle onderliggende elementen.
 */
export default function TvLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ cursor: "none" }}>{children}</div>;
}
