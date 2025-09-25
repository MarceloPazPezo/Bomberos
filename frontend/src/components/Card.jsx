// ---- Card liviano solo para DISEÑO
function Card({ title, titleIcon, children }) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 md:p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        {titleIcon ? titleIcon : null}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}
export default Card;