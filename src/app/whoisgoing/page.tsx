"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/app';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { IoIosHome } from 'react-icons/io';
import styles from './page.module.css';
import { motion } from 'framer-motion';

interface Invitee {
    id?: string;
    guests: number;
    name: string;
    code: string;
    rsvp: boolean;
}

async function getAllInvitees(firestore: any): Promise<Invitee[]> {
    const inviteesCol = collection(firestore, 'invitees');
    const inviteesSnapshot = await getDocs(inviteesCol);
    return inviteesSnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Invitee);
}


export default function WhoIsGoing() {
    const [invitees, setInvitees] = useState<Invitee[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchInvitees = async () => {
            const allInvitees = await getAllInvitees(firestore);
            setInvitees(allInvitees);
            setLoading(false);
        };

        fetchInvitees();
    }, []);


    return (
        <div className={styles.main}>
            <button className={styles.homeButton} onClick={() => window.location.href = '/'}>
                <IoIosHome size={24} />
            </button>
            <h1>Who's going?</h1>
            {loading ? (
                <div className={styles.spinner}></div>
            ) : (
                <div className={styles.cardsGrid}>
                    {invitees.map((invitee) => (
                        <motion.div
                            key={invitee.id}
                            className={`${styles.card} ${invitee.rsvp ? styles.rsvpYes : styles.rsvpNo}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 style={{ textAlign: 'center' }}>{invitee.name}</h2>
                            <p style={{ textAlign: 'center' }}>Guests: {invitee.guests}</p>
                            <p style={{ textAlign: 'center' }}>RSVP: {invitee.rsvp ? <FaCheck color="green" /> : <FaTimes color="red" />}</p>
                        </motion.div>
                    ))}
                </div>
            )}

        </div>
    );
}


