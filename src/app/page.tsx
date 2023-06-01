"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi'; // import the required icons
import styles from './page.module.css';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '@/firebase/app';

interface Invitee {
  id?: string;
  guests: number;
  name: string;
  code: string;
  rsvp: boolean;
}

async function updateInvitee(firestore: any, invitee: any) {
  if (invitee.id) {
    const inviteeRef = doc(firestore, 'invitees', invitee.id);

    await updateDoc(inviteeRef, invitee);
  } else {
    console.error('Error updating invitee: invitee id is missing');
  }
}

async function getInviteeByCode(firestore: any, code: string): Promise<Invitee | null> {
  const inviteesCol = collection(firestore, 'invitees');
  const q = query(inviteesCol, where("code", "==", code));
  const inviteesSnapshot = await getDocs(q);
  const inviteesList = inviteesSnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Invitee);
  return inviteesList.length > 0 ? inviteesList[0] : null;
}

export default function Home() {
  const [showCodeModal, setShowCodeModal] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteeData, setInviteeData] = useState<any | null>(null);

  const handleSubmit = async () => {
    const codeInput = document.getElementById('codeInput') as HTMLInputElement;
    const code = codeInput.value;

    setLoading(true);

    const invitee = await getInviteeByCode(firestore, code);

    setLoading(false);

    if (invitee) {
      setInviteeData(invitee);
      console.log(invitee);
      setShowCodeModal(false);
      setTimeout(() => setShowInfoModal(true), 900);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setInviteeData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleSubmitInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inviteeData) {
      console.log(inviteeData);
      setLoading(true);
      await updateInvitee(firestore, inviteeData);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <main className={styles.main}>
      <AnimatePresence>
        {showError && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            Invalid Code!
          </motion.div>
        )}
        {showSuccess && (
          <motion.div
            className={styles.success}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            Update Successful!
          </motion.div>
        )}
        {showCodeModal && (
          <motion.div
            id="myModal"
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <motion.div className={styles.modalContent}>
              <h2 className={styles.title}>Please Enter Your Code</h2>
              <input id="codeInput" className={styles.input} type="text" />
              <button className={`${styles.button} ${loading ? styles.loading : ''}`} onClick={handleSubmit}>
                Submit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            id="infoModal"
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            <motion.div className={styles.modalContent}>
              <h2 className={styles.title}>Welcome, {inviteeData?.name}!</h2>
              <form onSubmit={handleSubmitInfo}>
                <div className={styles.infoSection}>
                  <h1>Number of guests:</h1>
                  <div className={styles.guestsButtons}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={styles.guestsButton}
                      type="button"
                      onClick={() =>
                        setInviteeData((prevState: any) => ({
                          ...prevState,
                          guests: Math.max(0, prevState.guests - 1),
                        }))
                      }
                    >
                      <FiMinusCircle size={36} color='black' />
                    </motion.button>
                    <h1>{inviteeData?.guests}</h1>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={styles.guestsButton}
                      type="button"
                      onClick={() =>
                        setInviteeData((prevState: any) => ({
                          ...prevState,
                          guests: Math.min(10, prevState.guests + 1),
                        }))
                      }
                    >
                      <FiPlusCircle size={36} color='black' />
                    </motion.button>
                  </div>
                </div>
                <div className={styles.infoSection}>
                  <h1>
                    RSVP:{' '}
                    <input
                      className={styles.checkBox}
                      id="formRsvp"
                      type="checkbox"
                      name="rsvp"
                      checked={inviteeData?.rsvp || false}
                      onChange={handleInputChange}
                    />
                  </h1>
                </div>
                <button type="submit" className={`${styles.button} ${loading ? styles.loading : ''}`}>
                  Update
                </button>
              </form>
              <a href='/whoisgoing' className={styles.goingButton}>Who is going?</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
