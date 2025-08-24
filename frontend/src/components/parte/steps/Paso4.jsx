// src/components/parte/steps/Paso4.jsx
import React from "react";
import Card from "@components/ui/Card";
import TableAsistencia from "@components/parte/TableAsistencia";
import ModalAddUsuarios from "@components/parte/ModalAddUsuarios";
import { Users } from "lucide-react";
import BtnAdd from "@components/parte/BtnAdd";
import { getUsers } from "@services/usuario.service";

export default function Paso4({ watch, setValue }) {
  const enEmerg = watch("asistencia.enEmergenciaUserIds") || [];
  const enCuartel = watch("asistencia.enCuartelUserIds") || [];
  const [allUsers, setAllUsers] = React.useState([]);
  const [openEmerg, setOpenEmerg] = React.useState(false);
  const [openCuartel, setOpenCuartel] = React.useState(false);

  React.useEffect(() => { (async () => {
    const list = await getUsers();
    setAllUsers(Array.isArray(list) ? list : []);
  })(); }, []);

  const selectedIds = React.useMemo(() => new Set([...(enEmerg || []), ...(enCuartel || [])]), [enEmerg, enCuartel]);

  const rowsEmerg = allUsers.filter((u) => enEmerg.includes(u.id));
  const rowsCuartel = allUsers.filter((u) => enCuartel.includes(u.id));

  const removeEmerg = (id) => setValue("asistencia.enEmergenciaUserIds", (enEmerg || []).filter((x) => x !== id), { shouldDirty: true });
  const removeCuartel = (id) => setValue("asistencia.enCuartelUserIds", (enCuartel || []).filter((x) => x !== id), { shouldDirty: true });

  const addManyEmerg = (ids) => { const cur = new Set(enEmerg || []); ids.forEach((id) => cur.add(id)); setValue("asistencia.enEmergenciaUserIds", Array.from(cur), { shouldDirty: true }); };
  const addManyCuartel = (ids) => { const cur = new Set(enCuartel || []); ids.forEach((id) => cur.add(id)); setValue("asistencia.enCuartelUserIds", Array.from(cur), { shouldDirty: true }); };

  return (
    <div className="space-y-6">
      <Card title="10. Asistencia en emergencia" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => setOpenEmerg(true)} />}>
        <TableAsistencia rows={rowsEmerg} onRemove={removeEmerg} />
      </Card>
      <Card title="Asistencia en cuartel" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => setOpenCuartel(true)} />}>
        <TableAsistencia rows={rowsCuartel} onRemove={removeCuartel} />
      </Card>

      <ModalAddUsuarios open={openEmerg} title="Añadir asistentes a la emergencia" onClose={() => setOpenEmerg(false)} allUsers={allUsers} excludeIds={selectedIds} onConfirm={addManyEmerg} />
      <ModalAddUsuarios open={openCuartel} title="Añadir asistentes en cuartel" onClose={() => setOpenCuartel(false)} allUsers={allUsers} excludeIds={selectedIds} onConfirm={addManyCuartel} />
    </div>
  );
}
